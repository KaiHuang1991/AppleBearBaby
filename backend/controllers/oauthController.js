import crypto from 'crypto'
import userModel from '../models/userModel.js'
import { createToken, setAuthCookie, buildAuthPayload } from '../utils/authHelpers.js'
import {
    createGoogleOAuthClient,
    formatGoogleNetworkError,
    getBackendPublicUrl,
    getGoogleOAuthRedirectUri
} from '../utils/googleOAuthClient.js'
import { sendRegistrationNotifyEmail } from '../config/emailConfig.js'

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

const redirectLoginError = (res, message) => {
    res.redirect(`${frontendUrl()}/login?oauth_error=${encodeURIComponent(message)}`)
}

const respondWithAuth = (res, user) => {
    const token = createToken(user._id)
    setAuthCookie(res, token)
    return res.json(buildAuthPayload(user, token))
}

const findOrCreateOAuthUser = async ({ provider, providerId, email, name, avatar }) => {
    const idField = provider === 'google' ? 'googleId' : 'facebookId'

    let user = await userModel.findOne({ [idField]: providerId })
    if (user) {
        if (avatar && !user.avatar) {
            user.avatar = avatar
            await user.save()
        }
        return user
    }

    if (email) {
        user = await userModel.findOne({ email: email.toLowerCase() })
        if (user) {
            const existingId = user[idField]
            if (existingId && existingId !== providerId) {
                throw new Error('This email is linked to another account')
            }
            user[idField] = providerId
            user.isVerified = true
            user.verificationToken = undefined
            user.verificationTokenExpiry = undefined
            if (avatar && !user.avatar) user.avatar = avatar
            if (user.authProvider === 'local') user.authProvider = provider
            await user.save()
            return user
        }
    }

    if (!email) {
        throw new Error('Email permission is required to sign in')
    }

    const newUser = new userModel({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: '',
        [idField]: providerId,
        authProvider: provider,
        isVerified: true,
        avatar: avatar || ''
    })
    const saved = await newUser.save()

    sendRegistrationNotifyEmail({
        name: saved.name,
        email: saved.email,
        userId: saved.id,
        createdAt: saved.createdAt
    }).catch((err) => console.error('OAuth registration notify failed:', err))

    return saved
}

export const googleOAuthConfig = (req, res) => {
    const redirectUri = getGoogleOAuthRedirectUri(req)
    const clientId = process.env.GOOGLE_CLIENT_ID || ''
    res.json({
        clientId,
        redirectUri,
        alsoAddInConsole: [
            redirectUri,
            'http://localhost:4000/api/user/auth/google/callback',
            'http://127.0.0.1:4000/api/user/auth/google/callback'
        ].filter((v, i, a) => a.indexOf(v) === i),
        startUrl: `${getBackendPublicUrl()}/api/user/auth/google/start`,
        hint: 'Add every URI in alsoAddInConsole to Authorized redirect URIs. clientId must match the OAuth client you edited.'
    })
}

/** Browser redirect flow — uses Authorized redirect URIs (not JavaScript origins). */
export const googleAuthStart = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
        return redirectLoginError(
            res,
            '请在后端 .env 配置 GOOGLE_CLIENT_ID 与 GOOGLE_CLIENT_SECRET（OAuth 客户端密钥）'
        )
    }

    const state = crypto.randomBytes(16).toString('hex')
    res.cookie('google_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/'
    })

    const redirectUri = getGoogleOAuthRedirectUri(req)
    console.log('[Google OAuth] client_id:', clientId)
    console.log('[Google OAuth] redirect_uri:', redirectUri)

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('state', state)
    url.searchParams.set('access_type', 'online')
    url.searchParams.set('prompt', 'select_account')

    res.redirect(url.toString())
}

export const googleAuthCallback = async (req, res) => {
    try {
        if (req.query.error) {
            return redirectLoginError(res, req.query.error_description || req.query.error)
        }

        const { code, state } = req.query
        const expectedState = req.cookies?.google_oauth_state
        res.clearCookie('google_oauth_state', { path: '/' })

        if (!code || !state || !expectedState || state !== expectedState) {
            return redirectLoginError(res, 'Invalid OAuth state, please try again')
        }

        const clientId = process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET
        if (!clientId || !clientSecret) {
            return redirectLoginError(res, 'Google OAuth is not configured on server')
        }

        const redirectUri = getGoogleOAuthRedirectUri(req)
        const oauth2Client = createGoogleOAuthClient(redirectUri)
        const { tokens } = await oauth2Client.getToken(String(code))
        if (!tokens.id_token) {
            return redirectLoginError(res, 'Google did not return an ID token')
        }

        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId
        })
        const payload = ticket.getPayload()
        if (!payload?.sub) {
            return redirectLoginError(res, 'Invalid Google profile')
        }

        const user = await findOrCreateOAuthUser({
            provider: 'google',
            providerId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture || ''
        })

        const token = createToken(user._id)
        setAuthCookie(res, token)
        res.redirect(`${frontendUrl()}/login?oauth=google_success`)
    } catch (error) {
        console.error('Google OAuth callback error:', error)
        redirectLoginError(res, formatGoogleNetworkError(error))
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body
        if (!credential) {
            return res.json({ success: false, message: 'Missing Google credential' })
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.json({ success: false, message: 'Google sign-in is not configured' })
        }

        const client = createGoogleOAuthClient()
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()
        if (!payload?.sub) {
            return res.json({ success: false, message: 'Invalid Google token' })
        }

        const user = await findOrCreateOAuthUser({
            provider: 'google',
            providerId: payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture || ''
        })

        return respondWithAuth(res, user)
    } catch (error) {
        console.error('Google auth error:', error)
        res.json({ success: false, message: formatGoogleNetworkError(error) })
    }
}

export const facebookAuth = async (req, res) => {
    try {
        const { accessToken } = req.body
        if (!accessToken) {
            return res.json({ success: false, message: 'Missing Facebook access token' })
        }
        const appId = process.env.FACEBOOK_APP_ID
        const appSecret = process.env.FACEBOOK_APP_SECRET
        if (!appId || !appSecret) {
            return res.json({ success: false, message: 'Facebook sign-in is not configured' })
        }

        const debugUrl = new URL('https://graph.facebook.com/debug_token')
        debugUrl.searchParams.set('input_token', accessToken)
        debugUrl.searchParams.set('access_token', `${appId}|${appSecret}`)
        const debugRes = await fetch(debugUrl)
        const debugData = await debugRes.json()
        if (!debugData?.data?.is_valid || String(debugData.data.app_id) !== String(appId)) {
            return res.json({ success: false, message: 'Invalid Facebook token' })
        }

        const profileUrl = new URL('https://graph.facebook.com/me')
        profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)')
        profileUrl.searchParams.set('access_token', accessToken)
        const profileRes = await fetch(profileUrl)
        const profile = await profileRes.json()
        if (profile.error) {
            return res.json({ success: false, message: profile.error.message || 'Failed to load Facebook profile' })
        }

        const user = await findOrCreateOAuthUser({
            provider: 'facebook',
            providerId: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.picture?.data?.url || ''
        })

        return respondWithAuth(res, user)
    } catch (error) {
        console.error('Facebook auth error:', error)
        res.json({ success: false, message: error.message || 'Facebook sign-in failed' })
    }
}

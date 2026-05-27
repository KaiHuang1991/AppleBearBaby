import { OAuth2Client } from 'google-auth-library'
import { Gaxios } from 'gaxios'
import { HttpsProxyAgent } from 'https-proxy-agent'

export function getBackendPublicUrl() {
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '')
    const port = process.env.PORT || 4000
    return `http://localhost:${port}`
}

/** Must match Google Cloud Console → Authorized redirect URIs (exactly). */
export function getGoogleOAuthRedirectUri(req) {
    if (process.env.GOOGLE_REDIRECT_URI?.trim()) {
        return process.env.GOOGLE_REDIRECT_URI.trim().replace(/\/$/, '')
    }
    if (process.env.BACKEND_URL?.trim()) {
        return `${process.env.BACKEND_URL.trim().replace(/\/$/, '')}/api/user/auth/google/callback`
    }
    if (req && process.env.NODE_ENV !== 'production') {
        const host = req.get('host')
        if (host) {
            const proto = req.protocol === 'https' ? 'https' : 'http'
            return `${proto}://${host}/api/user/auth/google/callback`
        }
    }
    return `${getBackendPublicUrl()}/api/user/auth/google/callback`
}

export function getGoogleProxyUrl() {
    return (
        process.env.GOOGLE_HTTPS_PROXY ||
        process.env.HTTPS_PROXY ||
        process.env.HTTP_PROXY ||
        ''
    ).trim()
}

function maskProxyUrl(url) {
    return url.replace(/:[^:@/]+@/, ':***@')
}

/** OAuth2 client. Proxy is only attached when useProxy is true. */
export function createGoogleOAuthClient(redirectUri, { useProxy = false } = {}) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

    const options = { clientId, clientSecret }
    if (redirectUri) options.redirectUri = redirectUri

    if (useProxy) {
        const proxyUrl = getGoogleProxyUrl()
        if (!proxyUrl) {
            throw new Error('GOOGLE_HTTPS_PROXY is not configured')
        }
        console.log('[Google OAuth] Using HTTPS proxy (fallback):', maskProxyUrl(proxyUrl))
        options.transporter = new Gaxios({ agent: new HttpsProxyAgent(proxyUrl) })
    }

    return new OAuth2Client(options)
}

function isRetryableGoogleNetworkError(error) {
    const oauthErr =
        error?.response?.data?.error ||
        error?.cause?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '')
    if (oauthErr === 'invalid_client') return false

    const msg = String(error?.message || error || '')
    return (
        /ETIMEDOUT|ECONNREFUSED|ENOTFOUND|ECONNRESET|EAI_AGAIN|ETIMEOUT|socket hang up/i.test(msg) ||
        /oauth2\.googleapis\.com|www\.googleapis\.com/i.test(msg)
    )
}

/**
 * Run Google API call: direct first (VPS/production), proxy only on network failure if configured.
 */
export async function withGoogleOAuthClient(redirectUri, fn) {
    const proxyUrl = getGoogleProxyUrl()

    try {
        const client = createGoogleOAuthClient(redirectUri, { useProxy: false })
        return await fn(client)
    } catch (error) {
        if (!proxyUrl || !isRetryableGoogleNetworkError(error)) {
            throw error
        }
        console.warn(
            '[Google OAuth] Direct connection to Google failed, retrying via proxy:',
            maskProxyUrl(proxyUrl)
        )
        const client = createGoogleOAuthClient(redirectUri, { useProxy: true })
        return await fn(client)
    }
}

/** Exchange auth code and verify ID token (redirect OAuth flow). */
export async function googleExchangeCodeAndVerify(redirectUri, code, clientId) {
    return withGoogleOAuthClient(redirectUri, async (oauth2Client) => {
        const { tokens } = await oauth2Client.getToken(String(code))
        if (!tokens.id_token) {
            throw new Error('Google did not return an ID token')
        }
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId
        })
        return ticket.getPayload()
    })
}

/** Verify Google ID token from credential POST (legacy / optional). */
export async function googleVerifyIdTokenCredential(credential, clientId) {
    return withGoogleOAuthClient(null, async (client) => {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        })
        return ticket.getPayload()
    })
}

export function formatGoogleNetworkError(error) {
    const msg = String(error?.message || error || '')
    const oauthErr =
        error?.response?.data?.error ||
        error?.cause?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '')

    if (oauthErr === 'invalid_client' || /invalid_client/i.test(msg)) {
        return (
            'Google 客户端密钥错误（invalid_client）。请在 Cloud Console → 凭据 → 你的 Web OAuth 客户端 → ' +
            '「客户端密钥」复制最新密钥，写入 backend/.env 的 GOOGLE_CLIENT_SECRET，保存后重启后端。' +
            '若刚点击过「重置密钥」，必须使用新密钥，旧密钥会立即失效。'
        )
    }

    if (isRetryableGoogleNetworkError(error)) {
        const proxyHint = getGoogleProxyUrl()
            ? '（已尝试直连与代理均失败）'
            : '。VPS 上通常无需代理；本地开发若无法访问 Google，可在 backend/.env 设置 GOOGLE_HTTPS_PROXY 作为备用'
        return `无法连接 Google（oauth2.googleapis.com）${proxyHint}`
    }
    return msg || 'Google 登录失败'
}

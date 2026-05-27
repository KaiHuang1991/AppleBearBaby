import jwt from 'jsonwebtoken'

export const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

export const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    })
}

export const buildAuthPayload = (user, token) => ({
    success: true,
    token,
    userId: user._id?.toString?.() ?? user._id,
    userName: user.name,
    userEmail: user.email,
    avatar: user.avatar || '',
    joinDate: user.createdAt,
    isVerified: true
})

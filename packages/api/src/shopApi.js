/**
 * REST helpers for the Express shop backend. All methods return Axios responses
 * (use `.data`) so existing web code stays familiar.
 *
 * @param {import('axios').AxiosInstance} client - from createHttpClient
 */
export function createShopApi(client) {
  return {
    // --- User ---
    userResendVerification: (body) => client.post('/api/user/resend-verification', body),
    userForgotPassword: (body) => client.post('/api/user/forgot-password', body),
    userRegister: (body) => client.post('/api/user/register', body),
    userLogin: (body) => client.post('/api/user/login', body),
    userVerifyEmail: (verifyToken) => client.get(`/api/user/verify-email/${verifyToken}`),
    userResetPassword: (resetToken, body) =>
      client.post(`/api/user/reset-password/${resetToken}`, body),
    userProfile: () => client.get('/api/user/profile'),
    userAvatar: (formData) => client.put('/api/user/avatar', formData),
    userLogout: () => client.post('/api/user/logout'),

    // --- Content ---
    heroList: () => client.get('/api/hero'),
    chatbotMessage: (body) => client.post('/api/chatbot/message', body),

    blogsAll: (params) => client.get('/api/blogs/all', { params }),
    blogsGetById: (id) => client.get(`/api/blogs/${id}`),

    videosAll: (params) => client.get('/api/videos/all', { params }),
    videosGetById: (id) => client.get(`/api/videos/${id}`),
    videosByProduct: (productId) => client.get(`/api/videos/product/${productId}`),

    // --- Product & reviews ---
    productList: (params) => client.get('/api/product/list', { params }),
    productListComment: (body) => client.post('/api/product/listcomment', body),
    productLinkComment: (body) => client.post('/api/product/comment', body),
    reviewsAdd: (formData) => client.post('/api/reviews/add', formData),
    reviewsDelete: (reviewId) => client.delete(`/api/reviews/delete/${reviewId}`),

    // --- Cart ---
    cartAdd: (body) => client.post('/api/cart/add', body),
    cartSendInquiry: (body) => client.post('/api/cart/send-inquiry', body),
    cartClear: () => client.post('/api/cart/clear', {}),
    cartGet: () => client.post('/api/cart/get', {}),
    cartUpdate: (body) => client.post('/api/cart/update', body),

    // --- Categories ---
    categoriesList: () => client.get('/api/categories'),

    // --- Inquiries ---
    inquiriesCreate: (body) => client.post('/api/inquiries/create', body),
    inquiriesEmailStatus: (inquiryId, body) =>
      client.put(`/api/inquiries/email-status/${inquiryId}`, body),
    inquiriesUserList: (params) => client.get('/api/inquiries/user', { params }),
    inquiriesUserDelete: (inquiryId) => client.delete(`/api/inquiries/user/${inquiryId}`),
    inquiriesUserThread: (inquiryId) => client.get(`/api/inquiries/user/thread/${inquiryId}`),
    inquiriesUserThreadMessage: (inquiryId, body) =>
      client.post(`/api/inquiries/user/thread/${inquiryId}/messages`, body),
    inquiriesUserUnreadCount: () => client.get('/api/inquiries/user/unread-count'),
    inquiriesUserResend: (inquiryId, body) =>
      client.post(`/api/inquiries/user/${inquiryId}/resend`, body),

    // --- Blog comments (article comments) ---
    commentsBlog: (blogId) => client.get(`/api/comments/blog/${blogId}`),
    commentsAdd: (body) => client.post('/api/comments/add', body),
    commentsUpdate: (commentId, body) => client.put(`/api/comments/update/${commentId}`, body),
    commentsDelete: (commentId) => client.delete(`/api/comments/delete/${commentId}`),
  }
}

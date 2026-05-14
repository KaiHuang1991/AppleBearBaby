import express from 'express'
import { postChatMessage } from '../controllers/chatbotController.js'

const chatbotRoute = express.Router()

chatbotRoute.post('/message', postChatMessage)

export default chatbotRoute

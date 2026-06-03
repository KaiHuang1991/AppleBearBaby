import express from 'express'
import { productOgPage } from '../controllers/ogController.js'

const ogRoute = express.Router()

ogRoute.get('/product/:productId', productOgPage)

export default ogRoute

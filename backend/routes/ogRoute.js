import express from 'express'
import { blogOgPage, pageOgPage, productOgPage } from '../controllers/ogController.js'

const ogRoute = express.Router()

ogRoute.get('/product/:productId', productOgPage)
ogRoute.get('/blog/:blogKey', blogOgPage)
ogRoute.get('/page/:pageKey', pageOgPage)
ogRoute.get('/page', pageOgPage)

export default ogRoute

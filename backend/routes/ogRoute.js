import express from 'express'
import { blogOgPage, collectionCategoryOgPage, pageOgPage, productOgPage } from '../controllers/ogController.js'

const ogRoute = express.Router()

ogRoute.get('/product/:productId', productOgPage)
ogRoute.get('/blog/:blogKey', blogOgPage)
ogRoute.get('/page/collection/:slug', collectionCategoryOgPage)
ogRoute.get('/page/:pageKey', pageOgPage)
ogRoute.get('/page', pageOgPage)

export default ogRoute

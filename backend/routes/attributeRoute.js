import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import { createAttribute, listAttributes } from '../controllers/attributeController.js'

const attributeRoute = express.Router()

attributeRoute.post('/', adminAuth, createAttribute)
attributeRoute.get('/', listAttributes)

export default attributeRoute


import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {
  addFloatContact,
  adminListFloatContacts,
  deleteFloatContact,
  listFloatContacts,
  reorderFloatContacts,
  updateFloatContact,
} from '../controllers/floatContactController.js'

const floatContactRoute = express.Router()

floatContactRoute.get('/', listFloatContacts)
floatContactRoute.get('/admin', adminAuth, adminListFloatContacts)
floatContactRoute.put('/reorder', adminAuth, reorderFloatContacts)
floatContactRoute.post('/contact', adminAuth, addFloatContact)
floatContactRoute.put('/contact/:contactId', adminAuth, updateFloatContact)
floatContactRoute.delete('/contact/:contactId', adminAuth, deleteFloatContact)

export default floatContactRoute

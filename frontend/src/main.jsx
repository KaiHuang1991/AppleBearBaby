import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import ShopContextProvider, { ShopContext } from '../context/ShopContext.jsx'

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </HelmetProvider>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './context/AuthContext'
import './index.css'
import App from './App'
createRoot(document.getElementById('root')).render(
  <AuthContextProvider>   
     
    <App />
   </AuthContextProvider>
,
)

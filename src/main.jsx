import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // Tailwind અને ગ્લોબલ સ્ટાઈલ
import './App.css'     // તમારા કસ્ટમ કાર્ડ્સ અને અન્ય સ્ટાઈલ
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
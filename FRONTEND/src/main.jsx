import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/design-system.css'
import AppRedesigned from './AppRedesigned'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRedesigned />
  </StrictMode>,
)

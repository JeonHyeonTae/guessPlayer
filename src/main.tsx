import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CheonsindangBannerPreview } from './CheonsindangBanner'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{import.meta.env.DEV && new URLSearchParams(window.location.search).get('banner-preview') === '1' ? <CheonsindangBannerPreview /> : <App />}</StrictMode>,
)

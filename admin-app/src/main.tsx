import '@fontsource-variable/manrope'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AppProviders } from './app/providers'
import { router } from './app/router'
import './styles/global.css'

registerSW({ immediate: true })

createRoot(document.getElementById('app')!).render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>,
)

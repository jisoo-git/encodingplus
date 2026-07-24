import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { captureAttribution } from './lib/attribution'

// SPA 라우팅으로 URL 이 바뀌기 전, 첫 로드 시점에 유입경로(utm·리퍼러)를 캡처한다.
captureAttribution()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

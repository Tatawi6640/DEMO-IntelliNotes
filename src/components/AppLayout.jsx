import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import ChatbotWidget from './ChatbotWidget.jsx'

export default function AppLayout() {
  return (
    <div>
      <Header />
      <Outlet />
      <ChatbotWidget />
      <footer className="noPrint" style={{ padding: '24px 0 32px 0' }}>
        <div className="container">
          <div className="muted" style={{ textAlign: 'center', fontSize: 13 }}>
            Prototype IntelliNotes v1.1 — aucune donnée n’est envoyée sur Internet. (Tout reste dans ton navigateur.)
          </div>
        </div>
      </footer>
    </div>
  )
}


import React from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from '../components/TopNav.jsx'
import ChatbotWidget from '../components/ChatbotWidget.jsx'
import { StorageKeys } from '../lib/storage.js'
import { useStorageValue } from '../lib/useStorageValue.js'

export default function AuthedLayout() {
  const session = useStorageValue(StorageKeys.session, { role: 'guest', userId: null })
  const showChat = session.role === 'teacher' || session.role === 'admin'

  return (
    <div>
      <TopNav />
      <main style={{ padding: '18px 0 40px 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      {showChat ? <ChatbotWidget /> : null}
    </div>
  )
}

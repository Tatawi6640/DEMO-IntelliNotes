import React, { useState } from 'react'
import ChatPanel from './ChatPanel.jsx'

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="noPrint" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50 }}>
      {open ? (
        <div style={{ maxWidth: 'calc(100vw - 32px)' }}>
          <ChatPanel mode="widget" onClose={() => setOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn primary"
          style={{
            borderRadius: 999,
            padding: 12,
            boxShadow: '0 14px 40px rgba(2,38,69,0.20)',
          }}
          aria-label="Ouvrir le chatbot"
          title="Chatbot (FAQ + cours)"
        >
          <img src="/assets/mascot_ai_assistant.png" alt="" style={{ width: 28, height: 28 }} />
          <span style={{ display: 'inline-block' }}>Chat</span>
        </button>
      )}
    </div>
  )
}

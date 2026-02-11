import React, { useMemo, useRef, useState } from 'react'
import { replyTo } from '../lib/chatbot.js'

function MessageBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: 520,
          whiteSpace: 'pre-wrap',
          padding: '10px 12px',
          borderRadius: 14,
          border: '1px solid rgba(2,38,69,0.12)',
          background: isUser ? 'rgba(14,165,233,0.14)' : 'rgba(255,255,255,0.90)',
          color: '#0f172a',
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default function ChatPanel({ mode = 'widget', onClose }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [
    {
      role: 'bot',
      text: "Salam 👋 Moi c’est ITRILLo (démo). Je suis un chatbot règle‑based (pas une IA).",
    },
    {
      role: 'bot',
      text: 'ITRILLo (démo) répond فقط على الأسئلة اللي كنعرف (FAQ + cours).',
    },
  ])
  const listRef = useRef(null)

  const quickActions = useMemo(
    () => [
      { label: 'Recommander un cours', value: 'cours ML' },
      { label: 'Cours JavaScript', value: 'cours JavaScript' },
      { label: 'Devenir formateur', value: 'Comment devenir formateur ?' },
    ],
    [],
  )

  function scrollDownSoon() {
    setTimeout(() => {
      const el = listRef.current
      if (el) el.scrollTop = el.scrollHeight
    }, 10)
  }

  function send(text) {
    const t = String(text || '').trim()
    if (!t) return
    setMessages((prev) => [...prev, { role: 'user', text: t }, { role: 'bot', text: replyTo(t) }])
    setInput('')
    scrollDownSoon()
  }

  const isWidget = mode === 'widget'
  const height = isWidget ? 280 : 380

  return (
    <div className="card" style={{ width: isWidget ? 360 : '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          borderBottom: '1px solid rgba(2,38,69,0.12)',
          background: 'rgba(255,255,255,0.75)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <img src="/assets/mascot_ai_assistant.png" alt="ITRILLo" style={{ width: 34, height: 34 }} />
          <div style={{ display: 'grid', gap: 2 }}>
            <div style={{ fontWeight: 950 }}>Chatbot ITRILLo (démo)</div>
            <div className="muted" style={{ fontSize: 12 }}>
              FAQ + cours connus • règles simples
            </div>
          </div>
        </div>
        {onClose ? (
          <button className="btn ghost" onClick={onClose} style={{ padding: '8px 10px' }}>
            Fermer
          </button>
        ) : null}
      </div>

      <div ref={listRef} style={{ padding: 12, height, overflow: 'auto', display: 'grid', gap: 10 }}>
        {messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role} text={m.text} />
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(2,38,69,0.12)', display: 'grid', gap: 10 }}>
        <div className="muted" style={{ fontSize: 13 }}>
          ITRILLo (démo) répond فقط على الأسئلة اللي كنعرف (FAQ + cours).
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickActions.map((a) => (
            <button key={a.label} className="btn" onClick={() => send(a.value)} style={{ padding: '8px 10px' }}>
              {a.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input"
            value={input}
            placeholder="Écris ici… (ex: cours HTML, prix ML)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send(input)
            }}
          />
          <button className="btn primary" onClick={() => send(input)} style={{ padding: '12px 14px' }}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}

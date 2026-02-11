import React from 'react'
import Page from '../components/Page.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import Badge from '../components/Badge.jsx'

export default function ChatbotPage() {
  return (
    <Page
      title="Assistant / Chatbot — ITRILLo (démo)"
      subtitle="Pas une IA. Juste des règles + une base de connaissances (FAQ + liste de cours)."
      mascotSrc="/assets/mascot_ai_assistant.png"
    >
      <div className="grid" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge color="blue">FAQ</Badge>
            <Badge color="green">Cours connus</Badge>
            <Badge color="gray">Règles simples</Badge>
          </div>
          <p className="muted" style={{ margin: '10px 0 0 0' }}>
            ITRILLo (démo) répond فقط على الأسئلة اللي كنعرف (FAQ + cours). Essaie: “cours HTML”, “prix ML”, “packs”, “remboursement”,
            “devenir formateur”.
          </p>
        </div>

        <ChatPanel mode="page" />

        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Rappel</div>
          <div className="muted">
            Tout reste dans ton navigateur (localStorage). Aucune donnée n’est envoyée à un serveur.
          </div>
        </div>
      </div>
    </Page>
  )
}


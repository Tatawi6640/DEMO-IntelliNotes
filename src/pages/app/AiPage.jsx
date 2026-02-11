import React from 'react'
import PageTitle from '../../components/PageTitle.jsx'
import ChatPanel from '../../components/ChatPanel.jsx'
import Badge from '../../components/Badge.jsx'
import MascotAside from '../../components/MascotAside.jsx'

export default function AiPage() {
  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Assistant"
        subtitle="Chatbot démo (pas une IA): FAQ + cours connus, rules only."
        right={<Badge color="gray">Démo</Badge>}
      />
      <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
        <MascotAside mascotSrc="/assets/mascot_ai_assistant.png" mascotAlt="" mascotWidth={160} align="center">
          <div className="muted">ITRILLo (démo) répond فقط على الأسئلة اللي كنعرف (FAQ + cours).</div>
        </MascotAside>
      </div>
      <ChatPanel mode="page" />
    </div>
  )
}

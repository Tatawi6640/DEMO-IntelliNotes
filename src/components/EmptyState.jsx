import React from 'react'
import MascotAside from './MascotAside.jsx'

export default function EmptyState({ title, description, action, mascotSrc = '/assets/mascot.png' }) {
  return (
    <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
      <MascotAside mascotSrc={mascotSrc} mascotAlt="" mascotWidth={180} align="center">
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>{title}</div>
          {description ? <div className="muted">{description}</div> : null}
          {action ? <div style={{ marginTop: 10 }}>{action}</div> : null}
        </div>
      </MascotAside>
    </div>
  )
}

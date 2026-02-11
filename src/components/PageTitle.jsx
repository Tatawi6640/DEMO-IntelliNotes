import React from 'react'

export default function PageTitle({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.15 }}>{title}</h1>
        {subtitle ? (
          <div className="muted" style={{ marginTop: 8 }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  )
}


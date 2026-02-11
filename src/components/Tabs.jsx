import React from 'react'

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tabs.map((t) => {
        const active = value === t.value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`btn ${active ? 'primary' : 'ghost'}`}
            style={{ padding: '10px 12px' }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}


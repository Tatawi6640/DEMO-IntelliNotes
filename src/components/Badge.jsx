import React from 'react'

export default function Badge({ color = 'blue', children }) {
  const map = {
    blue: { border: 'rgba(14,165,233,0.35)', bg: 'rgba(14,165,233,0.10)', fg: '#075985' },
    green: { border: 'rgba(34,197,94,0.35)', bg: 'rgba(34,197,94,0.10)', fg: '#065f46' },
    orange: { border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.10)', fg: '#92400e' },
    red: { border: 'rgba(239,68,68,0.35)', bg: 'rgba(239,68,68,0.10)', fg: '#991b1b' },
    gray: { border: 'rgba(2,38,69,0.12)', bg: 'rgba(255,255,255,0.65)', fg: '#334155' },
  }
  const s = map[color] || map.gray
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.fg,
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {children}
    </span>
  )
}


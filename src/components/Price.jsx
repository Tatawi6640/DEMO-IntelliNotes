import React from 'react'
import { formatDH } from '../lib/currency.js'

export default function Price({ value, style }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid rgba(34,197,94,0.35)',
        background: 'rgba(34,197,94,0.10)',
        color: '#065f46',
        fontWeight: 900,
        ...style,
      }}
    >
      {formatDH(value)}
    </span>
  )
}


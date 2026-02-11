import React, { useState } from 'react'

function Placeholder({ label }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        border: '1px solid rgba(2,38,69,0.12)',
        background:
          'radial-gradient(600px 160px at 10% 0%, rgba(14,165,233,0.25), transparent 55%), radial-gradient(520px 180px at 100% 0%, rgba(34,197,94,0.20), transparent 60%), rgba(255,255,255,0.75)',
        display: 'grid',
        placeItems: 'center',
        padding: 14,
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 950 }}>
        {label || 'Couverture'}
        <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
          (cover manquante — placeholder)
        </div>
      </div>
    </div>
  )
}

export default function CourseCover({ src, alt, label, height = 140, style }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return (
      <div style={{ height, ...style }}>
        <Placeholder label={label} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || label || 'Couverture du cours'}
      onError={() => setBroken(true)}
      style={{
        width: '100%',
        height,
        objectFit: 'cover',
        borderRadius: 16,
        border: '1px solid rgba(2,38,69,0.12)',
        display: 'block',
        ...style,
      }}
    />
  )
}

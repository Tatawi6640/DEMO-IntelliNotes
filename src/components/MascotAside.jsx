import React from 'react'

export default function MascotAside({
  children,
  mascotSrc,
  mascotAlt = '',
  mascotWidth = 200,
  align = 'end',
}) {
  return (
    <div
      className="mascotAside"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 14,
        alignItems: align,
      }}
    >
      <div style={{ minWidth: 0 }}>{children}</div>
      {mascotSrc ? (
        <img
          src={mascotSrc}
          alt={mascotAlt}
          style={{
            width: mascotWidth,
            maxWidth: '40vw',
            height: 'auto',
            opacity: 1,
            pointerEvents: 'none',
            display: 'block',
            filter: 'drop-shadow(0 18px 30px rgba(2,38,69,0.12))',
          }}
        />
      ) : null}
    </div>
  )
}


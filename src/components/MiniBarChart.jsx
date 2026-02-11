import React from 'react'

export default function MiniBarChart({ title, data, formatValue }) {
  const max = Math.max(1, ...(data || []).map((d) => Number(d.value || 0)))
  return (
    <div className="surface" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {data?.length ? '7 derniers jours (démo)' : '—'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, data?.length || 0)}, 1fr)`, gap: 8, alignItems: 'end', marginTop: 12 }}>
        {(data || []).map((d) => {
          const v = Number(d.value || 0)
          const h = Math.round((v / max) * 64)
          return (
            <div key={d.label} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
              <div
                title={`${d.label}: ${formatValue ? formatValue(v) : v}`}
                style={{
                  width: '100%',
                  height: 72,
                  borderRadius: 12,
                  border: '1px solid rgba(2,38,69,0.10)',
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 6,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: Math.max(4, h),
                    borderRadius: 10,
                    background: 'linear-gradient(180deg, rgba(14,165,233,0.95), rgba(34,197,94,0.85))',
                  }}
                />
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                {d.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


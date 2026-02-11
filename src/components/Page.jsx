import React from 'react'

export default function Page({ title, subtitle, mascotSrc, mascotAlt = 'ITRILLo', heroRight, children }) {
  return (
    <main style={{ padding: '12px 0 26px 0' }}>
      <div className="container">
        <section className="card heroCard">
          <div className="heroGrid">
            <div className="heroText">
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>{title}</h1>
              {subtitle ? <div className="muted" style={{ marginTop: 8 }}>{subtitle}</div> : null}
            </div>

            <div className="heroArt" aria-label="Illustration">
              {heroRight ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  {heroRight}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <img
                      src={mascotSrc}
                      alt={mascotAlt}
                      style={{ width: 120, height: 'auto', display: 'block', filter: 'drop-shadow(0 16px 30px rgba(2,38,69,0.18))' }}
                    />
                  <div className="muted" style={{ fontSize: 13, maxWidth: 220, textAlign: 'right' }}>
                      Mascotte: <strong title="La mascotte IntelliNotes s'appelle ITRILLo.">ITRILLo</strong> (démo)
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
                  <img
                    src={mascotSrc}
                    alt={mascotAlt}
                    style={{
                      width: 'min(320px, 44vw)',
                      maxWidth: 360,
                      height: 'auto',
                      display: 'block',
                      filter: 'drop-shadow(0 18px 38px rgba(2,38,69,0.18))',
                    }}
                  />
                  <div className="muted" style={{ fontSize: 13, textAlign: 'right' }}>
                    <span title="La mascotte IntelliNotes s'appelle ITRILLo.">ITRILLo</span> te guide (démo)
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 18, marginTop: 14 }}>
          {children}
        </section>
      </div>
    </main>
  )
}

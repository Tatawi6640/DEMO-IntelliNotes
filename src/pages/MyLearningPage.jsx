import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'
import Price from '../components/Price.jsx'
import { StorageKeys, readStorage } from '../lib/storage.js'
import { getSession } from '../lib/session.js'
import { getCourseById, getPackById } from '../lib/catalog.js'
import { itemKey } from '../lib/commerce.js'
import { upsertProgress } from '../lib/session.js'

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)))
  return (
    <div style={{ border: '1px solid rgba(2,38,69,0.12)', borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.7)' }}>
      <div style={{ width: `${v}%`, height: 10, background: 'linear-gradient(90deg, rgba(14,165,233,0.95), rgba(34,197,94,0.85))' }} />
    </div>
  )
}

export default function MyLearningPage() {
  const session = getSession()
  const isStudent = session.role === 'student' && !!session.userId

  const { items, progressMap } = useMemo(() => {
    const purchases = readStorage(StorageKeys.purchases, [])
    const progress = readStorage(StorageKeys.progress, {})
    const myPurchases = purchases.filter((p) => p.userId === session.userId)
    const rawItems = myPurchases.flatMap((p) => p.items || [])

    const unique = new Map()
    for (const it of rawItems) unique.set(itemKey(it), it)
    const list = Array.from(unique.values())

    const resolved = list
      .map((it) => {
        if (it.type === 'course') {
          const c = getCourseById(it.id)
          return c ? { type: 'course', id: c.id, title: c.title, priceDH: c.priceDH, meta: c } : null
        }
        if (it.type === 'pack') {
          const p = getPackById(it.id)
          return p ? { type: 'pack', id: p.id, title: p.title, priceDH: p.priceDH, meta: p } : null
        }
        return null
      })
      .filter(Boolean)

    return { items: resolved, progressMap: progress || {} }
  }, [session.userId])

  return (
    <Page
      title="Mon Learning"
      subtitle="Tes achats (cours/packs) + une barre de progrès fake (0–100%)."
      mascotSrc="/assets/mascot_learning_helper.png"
    >
      {!isStudent ? (
        <div
          className="card"
          style={{
            padding: 14,
            boxShadow: 'none',
            borderColor: 'rgba(245,158,11,0.35)',
            background: 'rgba(245,158,11,0.08)',
          }}
        >
          <strong>Mode apprenant requis.</strong> Inscris-toi pour que “Mon learning” fonctionne.
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <Link to="/inscription/apprenant/etape-1" className="btn primary">
              Inscription apprenant
            </Link>
            <Link to="/catalogue" className="btn">
              Voir catalogue
            </Link>
          </div>
        </div>
      ) : null}

      {isStudent && !items.length ? (
        <div className="card" style={{ padding: 14, boxShadow: 'none', marginTop: 12 }}>
          <strong>Rien acheté pour l’instant.</strong>
          <div className="muted" style={{ marginTop: 8 }}>
            Va au catalogue/packs, ajoute au panier, puis checkout.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <Link to="/catalogue" className="btn primary">
              Catalogue
            </Link>
            <Link to="/packs" className="btn">
              Packs
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid" style={{ gap: 14, marginTop: 12 }}>
        {items.map((it) => {
          const key = `${it.type}:${it.id}`
          const current = Number(progressMap[key] || 0)
          const next = Math.min(100, current + 10)
          return (
            <div key={key} className="card" style={{ padding: 14, boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontWeight: 950 }}>{it.title}</div>
                <Price value={it.priceDH} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <Badge color={it.type === 'pack' ? 'green' : 'blue'}>{it.type === 'pack' ? 'Pack' : 'Cours'}</Badge>
                <Badge color="gray">Progress: {current}%</Badge>
              </div>
              <div style={{ marginTop: 10 }}>
                <ProgressBar value={current} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <button className="btn primary" onClick={() => upsertProgress(key, next)}>
                  Continuer (+10%)
                </button>
                {it.type === 'course' ? (
                  <Link className="btn" to={`/cours/${it.id}`}>
                    Ouvrir le cours
                  </Link>
                ) : (
                  <Link className="btn" to="/packs">
                    Voir le pack
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Page>
  )
}


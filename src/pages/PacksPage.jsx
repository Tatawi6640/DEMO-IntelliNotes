import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'
import Price from '../components/Price.jsx'
import { addToCart } from '../lib/cart.js'
import { getAllPacks, getCourseById } from '../lib/catalog.js'
import { computePackOriginalPrice } from '../lib/commerce.js'
import { formatDH } from '../lib/currency.js'

export default function PacksPage() {
  const packs = useMemo(() => getAllPacks(), [])

  return (
    <Page
      title="Packs IntelliNotes"
      subtitle="Un pack = bundle: cours + résumé + exercices, avec réduction."
      mascotSrc="/assets/mascot_business_confidence.png"
    >
      <div className="grid" style={{ gap: 14 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {packs.map((p) => {
            const original = computePackOriginalPrice(p)
            const saving = Math.max(0, original - p.priceDH)
            const courseTitles = (p.courseIds || []).map((id) => getCourseById(id)?.title).filter(Boolean)
            return (
              <div key={p.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontWeight: 950 }}>{p.title}</div>
                  <Price value={p.priceDH} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  <Badge color="green">-{p.discountPercent}%</Badge>
                  {saving > 0 ? <Badge color="gray">Économie: {formatDH(saving)}</Badge> : null}
                </div>
                <p className="muted" style={{ margin: '10px 0 0 0' }}>
                  {p.description}
                </p>
                <div className="muted" style={{ marginTop: 10 }}>
                  <strong>Inclus:</strong> {(p.includes || []).join(' • ')}
                </div>
                <div className="muted" style={{ marginTop: 10 }}>
                  <strong>Cours:</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
                    {courseTitles.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button className="btn primary" onClick={() => addToCart({ type: 'pack', id: p.id })}>
                    Ajouter au panier
                  </button>
                  <Link to="/panier" className="btn">
                    Voir panier
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/catalogue" className="btn">
            Voir le catalogue
          </Link>
          <Link to="/panier" className="btn success">
            Aller au panier
          </Link>
        </div>
      </div>
    </Page>
  )
}


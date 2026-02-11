import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'
import Price from '../components/Price.jsx'
import CourseCover from '../components/CourseCover.jsx'
import { addToCart } from '../lib/cart.js'
import { COURSE_CATEGORIES, COURSE_LEVELS, getAllCourses } from '../lib/catalog.js'
import { normalizeText } from '../lib/text.js'

export default function CatalogPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [level, setLevel] = useState('Tous')
  const [maxPrice, setMaxPrice] = useState(500)

  const courses = useMemo(() => {
    const q = normalizeText(query)
    return getAllCourses().filter((c) => {
      if (category !== 'Tous' && c.category !== category) return false
      if (level !== 'Tous' && c.level !== level) return false
      if (Number(c.priceDH || 0) > Number(maxPrice || 0)) return false
      if (!q) return true
      const hay = normalizeText(`${c.title} ${c.summary} ${c.category} ${c.level}`)
      return hay.includes(q)
    })
  }, [query, category, level, maxPrice])

  return (
    <Page
      title="Catalogue des cours"
      subtitle="Recherche + filtres (catégorie, niveau, prix max). Tu peux ajouter au panier مباشرة."
      mascotSrc="/assets/mascot.png"
    >
      <div className="grid" style={{ gap: 14 }}>
        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <div className="field">
              <div className="label">Recherche</div>
              <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex: JavaScript, ML, Flexbox…" />
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="field">
                <div className="label">Catégorie</div>
                <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Tous">Tous</option>
                  {COURSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <div className="label">Niveau</div>
                <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="Tous">Tous</option>
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <div className="label">Prix max</div>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={9999}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <div className="hint">Astuce: mets 200 si tu veux un budget friendly.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="muted">
          Résultats: <strong>{courses.length}</strong> cours
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {courses.map((c) => (
            <div key={c.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
              <CourseCover src={c.cover} label={c.category} height={140} style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontWeight: 950 }}>{c.title}</div>
                <Price value={c.priceDH} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                <Badge color="blue">{c.category}</Badge>
                <Badge color="gray">{c.level}</Badge>
                {c.source === 'teacher' ? <Badge color="orange">Formateur vérifié</Badge> : null}
              </div>
              <p className="muted" style={{ margin: '10px 0 0 0' }}>
                {c.summary}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <Link className="btn" to={`/cours/${c.id}`}>
                  Détails
                </Link>
                <button className="btn primary" onClick={() => addToCart({ type: 'course', id: c.id })}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/packs" className="btn">
            Voir les packs
          </Link>
          <Link to="/panier" className="btn success">
            Ouvrir le panier
          </Link>
        </div>
      </div>
    </Page>
  )
}

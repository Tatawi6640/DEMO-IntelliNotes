import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import CourseCover from '../../components/CourseCover.jsx'
import Price from '../../components/Price.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { COURSE_CATEGORIES, COURSE_LEVELS, getAllCourses } from '../../lib/catalog.js'
import { normalizeText } from '../../lib/text.js'
import { addToCart } from '../../lib/cart.js'
import { getSession } from '../../lib/session.js'

function CourseCard({ course, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card"
      style={{
        padding: 14,
        boxShadow: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'grid',
        gap: 10,
      }}
    >
      <CourseCover src={course.cover} label={course.category} height={140} />
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontWeight: 950, lineHeight: 1.15 }}>{course.title}</div>
          <Price value={course.priceDH} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge color="blue">{course.category}</Badge>
          <Badge color="gray">{course.level}</Badge>
          {course.tags?.slice(0, 2)?.map((t) => (
            <Badge key={t} color="gray">
              {t}
            </Badge>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          {course.shortDescription || course.summary}
        </div>
      </div>
    </button>
  )
}

export default function CatalogPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Tous')
  const [level, setLevel] = useState('Tous')
  const [tag, setTag] = useState('Tous')

  const all = useMemo(() => getAllCourses(), [])

  const tags = useMemo(() => {
    const set = new Set()
    for (const c of all) for (const t of c.tags || []) set.add(t)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [all])

  const courses = useMemo(() => {
    const q = normalizeText(query)
    return all.filter((c) => {
      if (category !== 'Tous' && c.category !== category) return false
      if (level !== 'Tous' && c.level !== level) return false
      if (tag !== 'Tous' && !(c.tags || []).includes(tag)) return false
      if (!q) return true
      const hay = normalizeText(`${c.title} ${c.shortDescription || ''} ${c.category} ${c.level} ${(c.tags || []).join(' ')}`)
      return hay.includes(q)
    })
  }, [all, query, category, level, tag])

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle title="Catalogue" subtitle="Trouve ton cours: recherche + filtres par catégorie, niveau et tag." />

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <MascotAside mascotSrc="/assets/mascot_learning_helper.png" mascotAlt="" mascotWidth={150} align="center">
            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
              <div className="field">
                <div className="label">Recherche</div>
                <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ex: Flexbox, CNN, DOM…" />
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
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
                  <div className="label">Tag</div>
                  <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
                    <option value="Tous">Tous</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </MascotAside>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="Aucun résultat"
            description="Change les filtres ou la recherche."
            mascotSrc="/assets/mascot_ai_assistant.png"
            action={
              <button className="btn" type="button" onClick={() => (setQuery(''), setCategory('Tous'), setLevel('Tous'), setTag('Tous'))}>
                Réinitialiser
              </button>
            }
          />
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {courses.map((c) => (
              <div key={c.id} style={{ display: 'grid', gap: 10 }}>
                <CourseCard course={c} onClick={() => navigate(`/course/${c.id}`)} />
                {session.role === 'student' ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn primary" type="button" onClick={() => addToCart({ type: 'course', id: c.id })}>
                      Ajouter au panier
                    </button>
                    <button className="btn ghost" type="button" onClick={() => navigate(`/course/${c.id}`)}>
                      Détails
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

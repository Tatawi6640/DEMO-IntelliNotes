import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import CourseCover from '../../components/CourseCover.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import Tabs from '../../components/Tabs.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Price from '../../components/Price.jsx'
import { getCourseById } from '../../lib/catalog.js'
import { getSession, upsertProgress } from '../../lib/session.js'
import { addToCart } from '../../lib/cart.js'
import { StorageKeys } from '../../lib/storage.js'
import { useStorageValue } from '../../lib/useStorageValue.js'

function QcmRunner({ qcm }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return null
    let ok = 0
    for (const q of qcm || []) {
      if (answers[q.id] === q.correct) ok += 1
    }
    return { ok, total: (qcm || []).length }
  }, [submitted, answers, qcm])

  if (!qcm?.length) return <div className="muted">Pas de QCM pour ce cours (démo).</div>

  return (
    <div className="grid" style={{ gap: 12 }}>
      {qcm.map((q, idx) => (
        <div key={q.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900 }}>
            {idx + 1}. {q.question}
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            {q.choices.map((c) => {
              const checked = answers[q.id] === c
              return (
                <label
                  key={c}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 14,
                    border: '1px solid rgba(2,38,69,0.12)',
                    background: checked ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.85)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={checked}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: c }))}
                  />
                  <span>{c}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {score ? (
        <div className="card" style={{ padding: 14, boxShadow: 'none', borderColor: 'rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.06)' }}>
          <strong>Résultat:</strong> {score.ok}/{score.total}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" type="button" onClick={() => setSubmitted(true)}>
          Valider le QCM
        </button>
        <button className="btn ghost" type="button" onClick={() => (setAnswers({}), setSubmitted(false))}>
          Recommencer
        </button>
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = getSession()
  const course = useMemo(() => getCourseById(id), [id])

  const enrollmentsAll = useStorageValue(StorageKeys.enrollments, {})
  const progressMap = useStorageValue(StorageKeys.progress, {})
  const enrolled = useMemo(() => (enrollmentsAll?.[session.userId] || []).includes(id), [enrollmentsAll, session.userId, id])
  const progressKey = `course:${id}`
  const progress = Number(progressMap[progressKey] || 0)

  const [tab, setTab] = useState('resume')

  function downloadResources() {
    const content = [
      `IntelliNotes — Ressources (démo)`,
      ``,
      `Cours: ${course.title}`,
      `Catégorie: ${course.category}`,
      `Niveau: ${course.level}`,
      ``,
      `Plan:`,
      ...(course.plan || []).map((x, i) => `  ${i + 1}. ${x}`),
      ``,
      `Exercices:`,
      ...(course.exercises || []).map((x, i) => `  - ${x}`),
      ``,
      `Note: Ceci est un export mock (pas le PDF original).`,
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `intellinotes_${course.id}_ressources.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!course) {
    return (
      <EmptyState
        title="Cours introuvable"
        description="Ce cours n’existe pas (ou n’est pas approuvé)."
        mascotSrc="/assets/mascot.png"
        action={
          <button className="btn primary" onClick={() => navigate('/catalog')}>
            Retour au catalogue
          </button>
        }
      />
    )
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title={course.title}
        subtitle={course.shortDescription || course.summary}
        right={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Price value={course.priceDH} style={{ fontSize: 16 }} />
            {session.role === 'student' ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {!enrolled ? (
                  <>
                    <button className="btn primary" onClick={() => addToCart({ type: 'course', id: course.id })}>
                      Ajouter au panier
                    </button>
                    <button
                      className="btn success"
                      onClick={() => {
                        addToCart({ type: 'course', id: course.id })
                        navigate('/cart')
                      }}
                    >
                      Acheter maintenant
                    </button>
                  </>
                ) : (
                  <Badge color="green">Acheté ✅</Badge>
                )}
              </div>
            ) : null}
            <button className="btn ghost" onClick={() => navigate('/catalog')}>
              Catalogue
            </button>
          </div>
        }
      />

      <section className="card" style={{ padding: 16, boxShadow: 'none', position: 'relative', overflow: 'hidden' }}>
        <MascotAside mascotSrc="/assets/mascot.png" mascotAlt="" mascotWidth={170} align="center">
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
            <CourseCover src={course.cover} label={course.category} height={240} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge color="blue">{course.category}</Badge>
              <Badge color="gray">{course.level}</Badge>
              {(course.tags || []).slice(0, 5).map((t) => (
                <Badge key={t} color="gray">
                  {t}
                </Badge>
              ))}
              {course.source === 'teacher' ? <Badge color="orange">Formateur</Badge> : null}
            </div>
            {enrolled ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge color="green">Progress: {Math.round(progress)}%</Badge>
                <button className="btn success" onClick={() => upsertProgress(progressKey, Math.min(100, progress + 10))}>
                  Continuer (+10%)
                </button>
                <button className="btn" onClick={downloadResources}>
                  Télécharger (mock)
                </button>
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13 }}>
                Ajoute au panier puis finalise l’achat (simulation) pour débloquer le contenu.
              </div>
            )}
          </div>
        </MascotAside>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'resume', label: 'Résumé' },
          { value: 'plan', label: 'Plan' },
          { value: 'exos', label: 'Exercices' },
          { value: 'qcm', label: 'QCM' },
        ]}
      />

      {tab === 'resume' ? (
        <section className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>Ce que tu vas apprendre</div>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: 18, display: 'grid', gap: 8 }} className="muted">
            {(course.whatYouLearn || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
          {course.description ? (
            <div className="muted" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
              {course.description}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'plan' ? (
        <section className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>Plan du cours</div>
          <ol style={{ margin: '10px 0 0 0', paddingLeft: 18, display: 'grid', gap: 8 }} className="muted">
            {(course.plan || course.outline || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {tab === 'exos' ? (
        <section className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>Exercices</div>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: 18, display: 'grid', gap: 8 }} className="muted">
            {(course.exercises || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <img
              src="/assets/mascot_conclusion_signature.png"
              alt=""
              style={{ width: 200, maxWidth: '55vw', height: 'auto', opacity: 1, pointerEvents: 'none' }}
            />
          </div>
        </section>
      ) : null}

      {tab === 'qcm' ? (
        <section className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>QCM (démo)</div>
            <div className="muted" style={{ fontSize: 13 }}>
              Petit quiz pour valider les bases.
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <QcmRunner qcm={course.qcm} />
          </div>
        </section>
      ) : null}
    </div>
  )
}

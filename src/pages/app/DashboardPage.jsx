import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import CourseCover from '../../components/CourseCover.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { getSession } from '../../lib/session.js'
import { StorageKeys, readStorage } from '../../lib/storage.js'
import { getAllCourses } from '../../lib/catalog.js'
import { recommendCourses } from '../../lib/recommendations.js'
import { upsertProgress } from '../../lib/session.js'
import { useStorageValue } from '../../lib/useStorageValue.js'

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value || 0)))
  return (
    <div style={{ border: '1px solid rgba(2,38,69,0.12)', borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.8)' }}>
      <div style={{ width: `${v}%`, height: 10, background: 'linear-gradient(90deg, rgba(14,165,233,0.95), rgba(34,197,94,0.85))' }} />
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const enrollmentsAll = useStorageValue(StorageKeys.enrollments, {})
  const progressMap = useStorageValue(StorageKeys.progress, {})

  const { student, enrolledCourses, recommendations, needsQcm } = useMemo(() => {
    const students = readStorage(StorageKeys.students, [])
    const s = students.find((x) => x.id === session.userId) || null
    const enrolledIds = enrollmentsAll?.[session.userId] || []
    const all = getAllCourses()
    const enrolled = enrolledIds.map((id) => all.find((c) => c.id === id)).filter(Boolean)
    const rec = s?.qcm ? recommendCourses(s.qcm) : []
    return { student: s, enrolledCourses: enrolled, recommendations: rec, needsQcm: !s?.qcm }
  }, [session.userId, enrollmentsAll, progressMap])

  if (needsQcm) {
    return (
      <EmptyState
        title="Termine ton onboarding"
        description="On a besoin de ton QCM pour personnaliser les recommandations."
        mascotSrc="/assets/mascot_future_vision.png"
        action={
          <button className="btn primary" onClick={() => navigate('/onboarding-qcm')}>
            Faire le QCM
          </button>
        }
      />
    )
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Mes cours"
        subtitle="Continue ton apprentissage, et découvre des recommandations adaptées."
        right={<Badge color="gray">{student?.studentRole === 'stagiaire' ? 'Stagiaire' : 'Étudiant'}</Badge>}
      />

      {!enrolledCourses.length ? (
        <EmptyState
          title="Aucun cours démarré"
          description="Parcours le catalogue, ajoute au panier, puis finalise l’achat."
          mascotSrc="/assets/mascot_learning_helper.png"
          action={
            <Link to="/catalog" className="btn primary">
              Aller au catalogue
            </Link>
          }
        />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {enrolledCourses.map((c) => {
            const key = `course:${c.id}`
            const current = Number(progressMap[key] || 0)
            const next = Math.min(100, current + 10)
            return (
              <div key={c.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                <CourseCover src={c.cover} label={c.category} height={150} />
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <div style={{ fontWeight: 950 }}>{c.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Badge color="blue">{c.category}</Badge>
                    <Badge color="gray">{c.level}</Badge>
                  </div>
                  <ProgressBar value={current} />
                  <div className="muted" style={{ fontSize: 13 }}>
                    Progression: <strong>{current}%</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn primary" onClick={() => upsertProgress(key, next)}>
                      Continuer (+10%)
                    </button>
                    <button className="btn ghost" onClick={() => navigate(`/course/${c.id}`)}>
                      Ouvrir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card" style={{ padding: 18, boxShadow: 'none', position: 'relative', overflow: 'hidden' }}>
        <MascotAside mascotSrc="/assets/mascot_guide_section.png" mascotAlt="" mascotWidth={150} align="center">
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Recommandations</div>
              <Link to="/catalog" className="btn">
                Voir tout le catalogue
              </Link>
            </div>
            <div className="muted">Basé sur ton QCM — ouvre un cours pour voir le détail et le prix.</div>
          </div>
        </MascotAside>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {recommendations.slice(0, 6).map((c) => (
          <button
            key={c.id}
            type="button"
            className="card"
            onClick={() => navigate(`/course/${c.id}`)}
            style={{ padding: 14, boxShadow: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <CourseCover src={c.cover} label={c.category} height={120} />
            <div style={{ marginTop: 10, fontWeight: 950 }}>{c.title}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <Badge color="blue">{c.category}</Badge>
              <Badge color="gray">{c.level}</Badge>
            </div>
            <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              {c.shortDescription || c.summary}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

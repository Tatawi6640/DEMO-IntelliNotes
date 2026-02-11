import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import { StorageKeys } from '../../lib/storage.js'
import { getSession, getCurrentUser } from '../../lib/session.js'
import { formatDH } from '../../lib/currency.js'
import { useStorageValue } from '../../lib/useStorageValue.js'

const COMMISSION = 0.2

function statusColor(status) {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'orange'
}

export default function TeacherDashboard() {
  const session = getSession()
  const teacher = useMemo(() => getCurrentUser(), [session.userId])
  const submittedCourses = useStorageValue(StorageKeys.submittedCourses, [])
  const purchases = useStorageValue(StorageKeys.purchases, [])

  const { myCourses, earnings } = useMemo(() => {
    const mine = (submittedCourses || []).filter((c) => c.teacherId === session.userId)

    const counts = new Map()
    for (const p of purchases || []) {
      for (const it of p.items || []) {
        if (it.type !== 'course') continue
        counts.set(it.id, (counts.get(it.id) || 0) + 1)
      }
    }

    const perCourse = mine.map((c) => {
      const sales = counts.get(c.id) || 0
      const earnPerSale = Math.round(Number(c.priceDH || 0) * (1 - COMMISSION))
      const total = earnPerSale * sales
      return { course: c, sales, earnPerSale, total }
    })
    const totalEarnings = perCourse.reduce((sum, x) => sum + x.total, 0)
    return { myCourses: perCourse, earnings: { totalEarnings } }
  }, [session.userId, submittedCourses, purchases])

  const isTeacher = session.role === 'teacher' && !!session.userId

  return (
    <Page
      title="Dashboard Formateur"
      subtitle="Tes cours soumis, statut (pending/approved/rejected) et estimation gains (commission 20%)."
      mascotSrc="/assets/mascot_business_confidence.png"
    >
      {!isTeacher ? (
        <div
          className="card"
          style={{
            padding: 14,
            boxShadow: 'none',
            borderColor: 'rgba(245,158,11,0.35)',
            background: 'rgba(245,158,11,0.08)',
          }}
        >
          <strong>Mode formateur requis.</strong> Inscris-toi en formateur pour accéder au dashboard.
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <Link to="/inscription/formateur/etape-1" className="btn success">
              Inscription formateur
            </Link>
            <Link to="/" className="btn">
              Accueil
            </Link>
          </div>
        </div>
      ) : null}

      {teacher ? (
        <div className="card" style={{ padding: 14, boxShadow: 'none', marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="muted">
              Formateur: <strong>{teacher.name}</strong> — {teacher.specialty}
            </div>
            <Badge color="green">Total estimé: {formatDH(earnings.totalEarnings)}</Badge>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <Link to="/inscription/formateur/etape-2" className="btn success">
          Soumettre un nouveau cours
        </Link>
        <Link to="/admin" className="btn">
          Admin (approbation)
        </Link>
      </div>

      <div className="grid" style={{ gap: 14, marginTop: 14 }}>
        {!myCourses.length ? (
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <strong>Aucun cours soumis.</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              Clique sur “Soumettre un nouveau cours”.
            </div>
          </div>
        ) : null}

        {myCourses.map(({ course, sales, earnPerSale, total }) => (
          <div key={course.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950 }}>{course.title}</div>
              <Price value={course.priceDH} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
              <Badge color={statusColor(course.status)}>{String(course.status).toUpperCase()}</Badge>
              <Badge color="gray">{course.category}</Badge>
              <Badge color="gray">{course.level}</Badge>
            </div>
            <div className="muted" style={{ marginTop: 10 }}>
              Commission plateforme: <strong>20%</strong> — Tu gagnes: <strong>{formatDH(earnPerSale)}</strong> par vente.
              <br />
              Ventes (simulées via achats): <strong>{sales}</strong> — Total estimé: <strong>{formatDH(total)}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link to={`/formateur/cours/${course.id}/edit`} className="btn">
                Modifier (draft/pending)
              </Link>
              {course.status === 'approved' ? (
                <Link to={`/cours/${course.id}`} className="btn primary">
                  Voir dans le catalogue
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}

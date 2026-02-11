import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import { addToCart } from '../../lib/cart.js'
import { StorageKeys, readStorage } from '../../lib/storage.js'
import { getSession } from '../../lib/session.js'
import { recommendCourses } from '../../lib/recommendations.js'

export default function StudentRecommendations() {
  const session = getSession()

  const { student, recommendations } = useMemo(() => {
    const students = readStorage(StorageKeys.students, [])
    const s = students.find((x) => x.id === session.userId) || null
    const rec = s?.qcm ? recommendCourses(s.qcm) : []
    return { student: s, recommendations: rec }
  }, [session.userId])

  return (
    <Page
      title="Recommandations"
      subtitle="Basé sur ton QCM: voici des cours qui matchent bien. (Tu peux ajouter direct au panier.)"
      mascotSrc="/assets/mascot_future_vision.png"
    >
      {!student?.qcm ? (
        <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
          <strong>Hmm…</strong> Pas de réponses QCM trouvées. Reviens à{' '}
          <Link to="/inscription/apprenant/qcm" style={{ textDecoration: 'underline' }}>
            ton QCM
          </Link>
          .
        </div>
      ) : null}

      <div className="grid" style={{ marginTop: 12 }}>
        {recommendations.map((c) => (
          <div key={c.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950 }}>{c.title}</div>
              <Price value={c.priceDH} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              <Badge color="blue">{c.category}</Badge>
              <Badge color="gray">{c.level}</Badge>
            </div>
            <p className="muted" style={{ margin: '10px 0 0 0' }}>
              {c.summary}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link to={`/cours/${c.id}`} className="btn">
                Voir détails
              </Link>
              <button className="btn primary" onClick={() => addToCart({ type: 'course', id: c.id })}>
                Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="hr" />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/catalogue" className="btn">
          Explorer tout le catalogue
        </Link>
        <Link to="/panier" className="btn success">
          Aller au panier
        </Link>
      </div>
    </Page>
  )
}


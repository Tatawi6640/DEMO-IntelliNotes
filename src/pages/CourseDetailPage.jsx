import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'
import Price from '../components/Price.jsx'
import CourseCover from '../components/CourseCover.jsx'
import { addToCart } from '../lib/cart.js'
import { getCourseById } from '../lib/catalog.js'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const course = useMemo(() => getCourseById(courseId), [courseId])

  if (!course) {
    return (
      <Page title="Cours introuvable" subtitle="Ce cours n’existe pas (ou pas encore approuvé)." mascotSrc="/assets/mascot.png">
        <Link to="/catalogue" className="btn primary">
          Retour au catalogue
        </Link>
      </Page>
    )
  }

  return (
    <Page
      title={course.title}
      subtitle="Détails du cours: aperçu gratuit, résumé (notes), et exercices."
      mascotSrc="/assets/mascot_learning_helper.png"
      heroRight={<CourseCover src={course.cover} label={course.category} height={220} />}
    >
      <div className="grid" style={{ gap: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge color="blue">{course.category}</Badge>
            <Badge color="gray">{course.level}</Badge>
            {course.author ? <Badge color="orange">Par {course.author}</Badge> : null}
          </div>
          <Price value={course.priceDH} />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={() => addToCart({ type: 'course', id: course.id })}>
            Ajouter au panier
          </button>
          <Link className="btn" to="/panier">
            Voir panier
          </Link>
        </div>

        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Preview (gratuit)</div>
          <div className="muted" style={{ whiteSpace: 'pre-wrap' }}>
            {course.preview}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="btn" to="/catalogue">
              Retour catalogue
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Résumé (notes structurées)</div>
          <ol className="muted" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {(course.outline || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ol>
        </div>

        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Exercices (aperçu)</div>
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
            {(course.exercises || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/packs" className="btn">
            Voir packs
          </Link>
        </div>
      </div>
    </Page>
  )
}

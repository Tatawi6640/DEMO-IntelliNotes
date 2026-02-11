import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import { makeId } from '../../lib/id.js'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../lib/catalog.js'
import { getSession, getCurrentUser } from '../../lib/session.js'
import { StorageKeys, updateStorage } from '../../lib/storage.js'

export default function TeacherSubmitCourse() {
  const navigate = useNavigate()
  const session = getSession()
  const teacher = useMemo(() => getCurrentUser(), [session.userId])

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('HTML')
  const [level, setLevel] = useState('Débutant')
  const [priceDH, setPriceDH] = useState(199)
  const [description, setDescription] = useState('')
  const [fileMeta, setFileMeta] = useState(null)
  const [submittedId, setSubmittedId] = useState(null)
  const [error, setError] = useState('')

  const isTeacher = session.role === 'teacher' && !!session.userId

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return setFileMeta(null)
    setFileMeta({ name: f.name, size: f.size, type: f.type || 'unknown', lastModified: f.lastModified })
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isTeacher || !teacher) return setError('Connecte-toi en formateur pour soumettre un cours.')
    if (!title.trim()) return setError('Titre requis.')
    if (!category.trim()) return setError('Catégorie requise.')
    if (!level.trim()) return setError('Niveau requis.')
    const n = Number(priceDH)
    if (!Number.isFinite(n) || n <= 0) return setError('Prix DH invalide.')
    if (!description.trim()) return setError('Description requise.')
    if (!fileMeta) return setError('Fichier requis (PDF/PPT/Word/...).')

    const teacherName = teacher.name
    const combined = `${title} ${description}`.toLowerCase()
    if (!combined.includes(teacherName.toLowerCase())) {
      return setError(`Ajoute ton nom “${teacherName}” dans le titre ou la description (anti‑fraude, démo).`)
    }

    const record = {
      id: makeId('tcourse'),
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      title: title.trim(),
      category,
      level,
      priceDH: Math.round(n),
      description: description.trim(),
      summary: description.trim().slice(0, 120) + (description.trim().length > 120 ? '…' : ''),
      file: fileMeta,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    updateStorage(StorageKeys.submittedCourses, (list) => [...(list || []), record], [])
    setSubmittedId(record.id)
  }

  return (
    <Page
      title="Soumettre un cours — étape 2/2"
      subtitle="Upload (metadata + fichier) puis statut: Pending verification (admin approuve/rejette)."
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
          <strong>Mode formateur requis.</strong> Reviens à l’inscription formateur.
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge color="orange">Formateur</Badge>
            <div className="muted">
              <strong>{teacher.name}</strong> — {teacher.email}
            </div>
          </div>
        </div>
      ) : null}

      {!submittedId ? (
        <form onSubmit={onSubmit} className="grid" style={{ gap: 14, marginTop: 12 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="field">
              <div className="label">Titre du cours</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: JavaScript Intermédiaire — par [Ton Nom]" />
              <div className="hint">Important: mentionne ton nom dans le titre ou la description (vérif anti‑scam).</div>
            </div>
            <div className="field">
              <div className="label">Catégorie</div>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
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
                {COURSE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">Prix (DH)</div>
              <input className="input" type="number" min={1} value={priceDH} onChange={(e) => setPriceDH(e.target.value)} />
              <div className="hint">Affichage: “199 DH”.</div>
            </div>
          </div>

          <div className="field">
            <div className="label">Description</div>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Ce cours est proposé par [Ton Nom]. On couvre: objectifs, plan, exercices…"
            />
          </div>

          <div className="field">
            <div className="label">Fichier du cours (PDF/PPT/Word/…)</div>
            <input className="input" type="file" onChange={onFileChange} />
            <div className="hint">Stockage: seulement les métadonnées (nom, taille, type). Aucun upload serveur.</div>
          </div>

          {fileMeta ? (
            <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Aperçu fichier (metadata)</div>
              <div className="muted">
                {fileMeta.name} — {Math.round(fileMeta.size / 1024)} KB — {fileMeta.type}
              </div>
            </div>
          ) : null}

          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 900 }}>Prix affiché</div>
              <Price value={priceDH} />
            </div>
          </div>

          {error ? (
            <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
              <strong>Erreur:</strong> {error}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn success" type="submit">
              Soumettre pour vérification
            </button>
            <button className="btn ghost" type="button" onClick={() => navigate('/formateur/dashboard')}>
              Aller au dashboard
            </button>
          </div>
        </form>
      ) : (
        <div className="grid" style={{ gap: 14, marginTop: 12 }}>
          <div
            className="card"
            style={{
              padding: 14,
              boxShadow: 'none',
              borderColor: 'rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.08)',
            }}
          >
            <div style={{ fontWeight: 950 }}>Statut: Pending verification</div>
            <p className="muted" style={{ margin: '8px 0 0 0' }}>
              On vérifie que tu es un vrai formateur (anti‑scam). Un admin peut approuver ou rejeter. Dès que c’est approuvé,
              ton cours apparaît dans le catalogue public.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link to="/formateur/dashboard" className="btn success">
                Voir mon dashboard
              </Link>
              <Link to="/admin" className="btn">
                Aller à l’admin (démo)
              </Link>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}


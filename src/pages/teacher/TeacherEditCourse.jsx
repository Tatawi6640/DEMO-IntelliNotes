import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import Badge from '../../components/Badge.jsx'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../lib/catalog.js'
import { StorageKeys, readStorage, updateStorage } from '../../lib/storage.js'
import { getSession } from '../../lib/session.js'

export default function TeacherEditCourse() {
  const { submittedCourseId } = useParams()
  const navigate = useNavigate()
  const session = getSession()

  const submitted = useMemo(() => readStorage(StorageKeys.submittedCourses, []), [])
  const initial = useMemo(() => submitted.find((c) => c.id === submittedCourseId) || null, [submittedCourseId])
  const owned = !!initial && initial.teacherId === session.userId

  const [title, setTitle] = useState(initial?.title || '')
  const [category, setCategory] = useState(initial?.category || 'HTML')
  const [level, setLevel] = useState(initial?.level || 'Débutant')
  const [priceDH, setPriceDH] = useState(initial?.priceDH || 199)
  const [description, setDescription] = useState(initial?.description || '')
  const [fileMeta, setFileMeta] = useState(initial?.file || null)
  const [error, setError] = useState('')

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileMeta({ name: f.name, size: f.size, type: f.type || 'unknown', lastModified: f.lastModified })
  }

  function onSave(e) {
    e.preventDefault()
    setError('')
    if (!owned) return setError('Accès refusé.')
    if (!title.trim()) return setError('Titre requis.')
    if (!description.trim()) return setError('Description requise.')
    const n = Number(priceDH)
    if (!Number.isFinite(n) || n <= 0) return setError('Prix invalide.')

    updateStorage(
      StorageKeys.submittedCourses,
      (list) =>
        (list || []).map((c) =>
          c.id === initial.id
            ? {
                ...c,
                title: title.trim(),
                category,
                level,
                priceDH: Math.round(n),
                description: description.trim(),
                summary: description.trim().slice(0, 120) + (description.trim().length > 120 ? '…' : ''),
                file: fileMeta || c.file,
                updatedAt: Date.now(),
              }
            : c,
        ),
      [],
    )
    navigate('/formateur/dashboard')
  }

  if (!initial) {
    return (
      <Page title="Cours introuvable" subtitle="Aucun cours soumis trouvé." mascotSrc="/assets/mascot_business_confidence.png">
        <Link to="/formateur/dashboard" className="btn primary">
          Retour dashboard
        </Link>
      </Page>
    )
  }

  return (
    <Page
      title="Modifier mon cours"
      subtitle="Tu peux modifier un cours draft/pending. Si c’est déjà approuvé, les changements restent possibles (démo)."
      mascotSrc="/assets/mascot_business_confidence.png"
    >
      {!owned ? (
        <div
          className="card"
          style={{
            padding: 14,
            boxShadow: 'none',
            borderColor: 'rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.08)',
          }}
        >
          <strong>Accès refusé.</strong> Ce cours n’appartient pas à ta session formateur.
        </div>
      ) : null}

      <div className="card" style={{ padding: 14, boxShadow: 'none', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge color="gray">ID: {initial.id}</Badge>
          <Badge color="orange">Statut: {String(initial.status).toUpperCase()}</Badge>
        </div>
      </div>

      <form onSubmit={onSave} className="grid" style={{ gap: 14, marginTop: 12 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="field">
            <div className="label">Titre</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          </div>
        </div>

        <div className="field">
          <div className="label">Description</div>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="field">
          <div className="label">Fichier (optionnel — remplace la metadata)</div>
          <input className="input" type="file" onChange={onFileChange} />
          <div className="hint">On ne stocke que la metadata du fichier.</div>
        </div>

        {fileMeta ? (
          <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
            <strong>Fichier actuel:</strong> {fileMeta.name} ({Math.round(fileMeta.size / 1024)} KB)
          </div>
        ) : null}

        {error ? (
          <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn success" type="submit" disabled={!owned}>
            Enregistrer
          </button>
          <Link className="btn" to="/formateur/dashboard">
            Annuler
          </Link>
        </div>
      </form>
    </Page>
  )
}


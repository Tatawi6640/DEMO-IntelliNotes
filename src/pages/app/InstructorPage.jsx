import React, { useMemo, useState } from 'react'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../lib/catalog.js'
import { getSession } from '../../lib/session.js'
import { makeId } from '../../lib/id.js'
import { StorageKeys, updateStorage } from '../../lib/storage.js'
import { useStorageValue } from '../../lib/useStorageValue.js'

function statusColor(status) {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'orange'
}

export default function InstructorPage() {
  const session = getSession()
  const teachers = useStorageValue(StorageKeys.teachers, [])
  const teacher = useMemo(() => (teachers || []).find((t) => t.id === session.userId) || null, [teachers, session.userId])
  const submittedCourses = useStorageValue(StorageKeys.submittedCourses, [])
  const contactAll = useStorageValue(StorageKeys.teacherContact, {})

  const myCourses = useMemo(
    () => (submittedCourses || []).filter((c) => c.teacherId === session.userId).sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)),
    [submittedCourses, session.userId],
  )

  const [section, setSection] = useState('dashboard') // dashboard | upload | downloads | contact

  const verificationStatus = teacher?.verificationStatus || 'required'

  const [editingId, setEditingId] = useState(null)
  const editing = useMemo(() => myCourses.find((c) => c.id === editingId) || null, [myCourses, editingId])

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('HTML')
  const [level, setLevel] = useState('Débutant')
  const [tags, setTags] = useState('web, fundamentals')
  const [priceDH, setPriceDH] = useState(199)
  const [description, setDescription] = useState('')
  const [fileMeta, setFileMeta] = useState(null)
  const [verificationDoc, setVerificationDoc] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  function loadForEdit(course) {
    setEditingId(course.id)
    setTitle(course.title || '')
    setCategory(course.category || 'HTML')
    setLevel(course.level || 'Débutant')
    setTags((course.tags || []).join(', '))
    setPriceDH(course.priceDH || 199)
    setDescription(course.description || '')
    setFileMeta(course.file || null)
    setError('')
    setNotice('')
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setCategory('HTML')
    setLevel('Débutant')
    setTags('web, fundamentals')
    setPriceDH(199)
    setDescription('')
    setFileMeta(null)
    setError('')
    setNotice('')
  }

  function onFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return setFileMeta(null)
    setFileMeta({ name: f.name, size: f.size, type: f.type || 'unknown', lastModified: f.lastModified })
  }

  function onVerificationFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return setVerificationDoc(null)
    setVerificationDoc({ name: f.name, size: f.size, type: f.type || 'unknown', lastModified: f.lastModified })
  }

  function parseTags(s) {
    return String(s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 8)
  }

  function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!teacher) return setError('Session formateur introuvable.')
    if (verificationStatus !== 'approved') return setError('Accès bloqué: compte formateur non vérifié.')
    if (!title.trim()) return setError('Titre requis.')
    if (!description.trim()) return setError('Description requise.')
    if (!fileMeta) return setError('Fichier requis (PDF/PPT/Word/…).')
    const n = Number(priceDH)
    if (!Number.isFinite(n) || n <= 0) return setError('Prix DH invalide.')

    const record = {
      id: editingId || makeId('tcourse'),
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      title: title.trim(),
      category,
      level,
      tags: parseTags(tags),
      priceDH: Math.round(n),
      shortDescription: description.trim().slice(0, 120) + (description.trim().length > 120 ? '…' : ''),
      description: description.trim(),
      file: fileMeta,
      status: 'pending',
      createdAt: editing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    updateStorage(
      StorageKeys.submittedCourses,
      (list) => {
        const items = list || []
        const exists = items.some((c) => c.id === record.id)
        return exists ? items.map((c) => (c.id === record.id ? record : c)) : [...items, record]
      },
      [],
    )
    setNotice(editingId ? 'Modifications enregistrées (statut repasse en pending).' : 'Cours soumis: pending verification.')
    resetForm()
  }

  function submitVerification(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!teacher) return setError('Session formateur introuvable.')
    if (!verificationDoc) return setError('Fichier requis (PDF ou autre).')

    const submittedAt = Date.now()
    const reviewDueAt = submittedAt + 24 * 60 * 60 * 1000

    updateStorage(
      StorageKeys.teachers,
      (list) =>
        (list || []).map((t) =>
          t.id === teacher.id
            ? {
                ...t,
                verificationStatus: 'pending',
                verificationDoc,
                verificationSubmittedAt: submittedAt,
                verificationReviewDueAt: reviewDueAt,
              }
            : t,
        ),
      [],
    )
    setNotice("Document envoyé (simulation). Vérification sous 24h max.")
    setVerificationDoc(null)
  }

  function sendContact(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (!teacher) return setError('Session formateur introuvable.')
    if (verificationStatus !== 'approved') return setError('Compte non vérifié: contact limité.')
    if (!contactSubject.trim()) return setError('Sujet requis.')
    if (!contactMessage.trim()) return setError('Message requis.')

    const msg = {
      id: makeId('msg'),
      teacherId: teacher.id,
      subject: contactSubject.trim(),
      message: contactMessage.trim(),
      createdAt: Date.now(),
      status: 'sent',
    }
    updateStorage(
      StorageKeys.teacherContact,
      (all) => {
        const next = { ...(all || {}) }
        const list = Array.isArray(next[teacher.id]) ? next[teacher.id] : []
        next[teacher.id] = [msg, ...list].slice(0, 30)
        return next
      },
      {},
    )
    setContactSubject('')
    setContactMessage('')
    setNotice('Message envoyé (démo).')
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Formateur"
        subtitle="Vérification (≤24h) puis accès à ton espace: dashboard, téléchargements, contact."
        right={teacher ? <Badge color="gray">{teacher.name}</Badge> : null}
      />

      {verificationStatus !== 'approved' ? (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <MascotAside mascotSrc="/assets/mascot_business_confidence.png" mascotAlt="" mascotWidth={210} align="center">
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Vérification du formateur</div>
              <div className="muted">
                Étape 2: envoie un PDF (ou autre fichier). On le “reçoit” (simulation) puis on accepte/rejette sous <strong>24h max</strong>.
              </div>

              {verificationStatus === 'required' || verificationStatus === 'rejected' ? (
                <form onSubmit={submitVerification} className="grid" style={{ gap: 12 }}>
                  <div className="field">
                    <div className="label">Document de vérification (PDF ou autre)</div>
                    <input className="input" type="file" onChange={onVerificationFileChange} />
                    <div className="hint">Démo: le fichier est “envoyé à IntelliNotes” mais on stocke seulement la metadata.</div>
                  </div>

                  {verificationDoc ? (
                    <div className="surface" style={{ padding: 12 }}>
                      <div className="muted">
                        <strong>Fichier:</strong> {verificationDoc.name} • {Math.round(verificationDoc.size / 1024)} KB • {verificationDoc.type}
                      </div>
                    </div>
                  ) : null}

                  {verificationStatus === 'rejected' ? (
                    <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}>
                      <strong>Rejeté.</strong> Tu peux renvoyer un document.
                    </div>
                  ) : null}

                  <button className="btn success" type="submit">
                    Envoyer & Démarrer l’attente
                  </button>
                </form>
              ) : null}

              {verificationStatus === 'pending' ? (
                <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)' }}>
                  <strong>En attente…</strong> Ton document est en cours de traitement (≤ 24h).
                  <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                    Envoyé: {teacher?.verificationSubmittedAt ? new Date(teacher.verificationSubmittedAt).toLocaleString() : '—'} •
                    Échéance max: {teacher?.verificationReviewDueAt ? new Date(teacher.verificationReviewDueAt).toLocaleString() : '—'}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                  <strong>Erreur:</strong> {error}
                </div>
              ) : null}
              {notice ? (
                <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(34,197,94,0.30)', background: 'rgba(34,197,94,0.08)' }}>
                  {notice}
                </div>
              ) : null}
            </div>
          </MascotAside>
        </div>
      ) : (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge color="green">Vérifié ✅</Badge>
              <div className="muted">Accès complet activé.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`btn ${section === 'dashboard' ? 'primary' : 'ghost'}`} onClick={() => setSection('dashboard')}>
                Dashboard
              </button>
              <button className={`btn ${section === 'upload' ? 'primary' : 'ghost'}`} onClick={() => setSection('upload')}>
                Déposer cours
              </button>
              <button className={`btn ${section === 'downloads' ? 'primary' : 'ghost'}`} onClick={() => setSection('downloads')}>
                Téléchargements
              </button>
              <button className={`btn ${section === 'contact' ? 'primary' : 'ghost'}`} onClick={() => setSection('contact')}>
                Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'approved' && section === 'dashboard' ? (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Mon dashboard</div>
            <Badge color="gray">Cours soumis: {myCourses.length}</Badge>
          </div>
          {!myCourses.length ? (
            <div style={{ marginTop: 12 }}>
              <EmptyState
                title="Aucun cours soumis"
                description="Dépose ton premier cours dans “Déposer cours”."
                mascotSrc="/assets/mascot_guide_section.png"
              />
            </div>
          ) : (
            <div className="grid" style={{ gap: 12, marginTop: 12 }}>
              {myCourses.map((c) => (
                <div key={c.id} className="surface" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{c.title}</div>
                    <Badge color={statusColor(c.status)}>{String(c.status).toUpperCase()}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <Badge color="blue">{c.category}</Badge>
                    <Badge color="gray">{c.level}</Badge>
                    <Badge color="green">{c.priceDH} DH</Badge>
                    {(c.tags || []).slice(0, 4).map((t) => (
                      <Badge key={t} color="gray">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    {c.shortDescription}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    <button className="btn" type="button" onClick={() => loadForEdit(c)}>
                      Modifier
                    </button>
                    <button className="btn ghost" type="button" onClick={() => downloadJson(`cours_${c.id}.json`, c)}>
                      Exporter JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {verificationStatus === 'approved' && section === 'upload' ? (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>{editingId ? 'Modifier un cours' : 'Déposer un cours'}</div>
            {editingId ? (
              <button className="btn ghost" type="button" onClick={resetForm}>
                Annuler édition
              </button>
            ) : null}
          </div>

          <form onSubmit={submit} className="grid" style={{ gap: 12, marginTop: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field">
                <div className="label">Titre</div>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: JavaScript DOM — projets guidés" />
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
                <div className="label">Tags (séparés par virgules)</div>
                <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ex: dom, async, projets" />
              </div>
              <div className="field">
                <div className="label">Prix (DH)</div>
                <input className="input" type="number" min={1} value={priceDH} onChange={(e) => setPriceDH(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <div className="label">Description</div>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objectifs, plan, exercices…" />
            </div>

            <div className="field">
              <div className="label">Fichier du cours (PDF/PPT/Word/…)</div>
              <input className="input" type="file" onChange={onFileChange} />
              <div className="hint">Démo: on stocke uniquement la metadata du fichier, pas le contenu.</div>
            </div>

            {fileMeta ? (
              <div className="surface" style={{ padding: 12 }}>
                <div className="muted">
                  <strong>Fichier:</strong> {fileMeta.name} • {Math.round(fileMeta.size / 1024)} KB • {fileMeta.type}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}
            {notice ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(34,197,94,0.30)', background: 'rgba(34,197,94,0.08)' }}>
                {notice}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn success" type="submit">
                {editingId ? 'Enregistrer' : 'Soumettre (pending)'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {verificationStatus === 'approved' && section === 'downloads' ? (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <MascotAside mascotSrc="/assets/mascot_future_vision.png" mascotAlt="" mascotWidth={180} align="center">
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Téléchargements</div>
              <div className="muted">
                Démo localStorage: le contenu des fichiers n’est pas stocké. Tu peux exporter les fiches de tes cours (JSON).
              </div>
              {!myCourses.length ? (
                <div className="muted">Aucun cours à exporter.</div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn" type="button" onClick={() => downloadJson('mes_cours.json', myCourses)}>
                    Exporter tous (JSON)
                  </button>
                </div>
              )}
            </div>
          </MascotAside>
        </div>
      ) : null}

      {verificationStatus === 'approved' && section === 'contact' ? (
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <MascotAside mascotSrc="/assets/mascot_ai_assistant.png" mascotAlt="" mascotWidth={170} align="center">
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Contactez-nous</div>
                <div className="muted">Démo: le message est sauvegardé localement. (Comme si c’était envoyé.)</div>
              </div>
              <form onSubmit={sendContact} className="grid" style={{ gap: 12 }}>
                <div className="field">
                  <div className="label">Sujet</div>
                  <input className="input" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} />
                </div>
                <div className="field">
                  <div className="label">Message</div>
                  <textarea className="textarea" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
                </div>
                <button className="btn primary" type="submit">
                  Envoyer
                </button>
              </form>

              <div className="surface" style={{ padding: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Historique (local)</div>
                {(contactAll?.[teacher?.id] || []).length ? (
                  <div className="grid" style={{ gap: 10 }}>
                    {(contactAll?.[teacher?.id] || []).slice(0, 6).map((m) => (
                      <div key={m.id} className="muted" style={{ fontSize: 13 }}>
                        <strong>{m.subject}</strong> — {new Date(m.createdAt).toLocaleString()}
                        <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{m.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="muted">Aucun message.</div>
                )}
              </div>
            </div>
          </MascotAside>
        </div>
      ) : null}
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import { makeId } from '../../lib/id.js'
import { StorageKeys, updateStorage } from '../../lib/storage.js'
import { setSession } from '../../lib/session.js'

export default function TeacherRegisterStep1() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [specialty, setSpecialty] = useState('Web')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Nom requis.')
    if (!email.trim() || !email.includes('@')) return setError('Email valide requis.')
    if (!specialty.trim()) return setError('Spécialité requise.')

    const teacher = { id: makeId('teacher'), name: name.trim(), email: email.trim().toLowerCase(), specialty, createdAt: Date.now() }
    updateStorage(StorageKeys.teachers, (list) => [...(list || []), teacher], [])
    setSession({ role: 'teacher', userId: teacher.id })
    navigate('/inscription/formateur/etape-2')
  }

  return (
    <Page
      title="Inscription formateur — étape 1/2"
      subtitle="Infos de base, ثم upload d’un cours (metadata + fichier)."
      mascotSrc="/assets/mascot_business_confidence.png"
    >
      <form onSubmit={onSubmit} className="grid" style={{ gap: 14 }}>
        <div className="field">
          <div className="label">Nom complet</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mohammed A." />
        </div>
        <div className="field">
          <div className="label">Email</div>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: prof@email.com" type="email" />
        </div>
        <div className="field">
          <div className="label">Spécialité</div>
          <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex: JavaScript, ML…" />
          <div className="hint">Ça aide à classer tes cours (démo).</div>
        </div>

        {error ? (
          <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn success" type="submit">
            Continuer (upload cours)
          </button>
        </div>
      </form>
    </Page>
  )
}


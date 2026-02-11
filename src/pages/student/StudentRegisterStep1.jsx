import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import { makeId } from '../../lib/id.js'
import { StorageKeys, updateStorage } from '../../lib/storage.js'
import { setSession } from '../../lib/session.js'

export default function StudentRegisterStep1() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('étudiant')
  const [error, setError] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Nom requis.')
    if (!email.trim() || !email.includes('@')) return setError('Email valide requis.')

    const student = {
      id: makeId('student'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentRole: role,
      qcm: null,
      createdAt: Date.now(),
    }

    updateStorage(StorageKeys.students, (list) => [...(list || []), student], [])
    setSession({ role: 'student', userId: student.id })
    navigate('/inscription/apprenant/qcm')
  }

  return (
    <Page
      title="Inscription apprenant — étape 1/2"
      subtitle="On prend les infos de base, ensuite un QCM pour te recommander les meilleurs cours."
      mascotSrc="/assets/mascot_learning_helper.png"
    >
      <form onSubmit={onSubmit} className="grid" style={{ gap: 14 }}>
        <div className="field">
          <div className="label">Nom complet</div>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sara El Amrani" />
        </div>
        <div className="field">
          <div className="label">Email</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: sara@email.com"
            type="email"
          />
        </div>
        <div className="field">
          <div className="label">Statut</div>
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="étudiant">Étudiant</option>
            <option value="stagiaire">Stagiaire</option>
          </select>
          <div className="hint">T’inquiète, c’est juste pour personnaliser le parcours.</div>
        </div>

        {error ? (
          <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" type="submit">
            Continuer vers le QCM
          </button>
        </div>
      </form>
    </Page>
  )
}


import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import { StorageKeys, readStorage, updateStorage } from '../../lib/storage.js'
import { getSession } from '../../lib/session.js'
import { QCM_QUESTIONS } from './qcmQuestions.js'

function initAnswers() {
  const base = {}
  for (const q of QCM_QUESTIONS) base[q.id] = q.multi ? [] : ''
  return base
}

export default function StudentQcm() {
  const navigate = useNavigate()
  const session = getSession()
  const [answers, setAnswers] = useState(() => initAnswers())
  const [error, setError] = useState('')

  const student = useMemo(() => {
    const students = readStorage(StorageKeys.students, [])
    return students.find((s) => s.id === session.userId) || null
  }, [session.userId])

  function setAnswer(q, value) {
    setAnswers((prev) => {
      if (!q.multi) return { ...prev, [q.id]: value }
      const current = new Set(prev[q.id] || [])
      if (current.has(value)) current.delete(value)
      else current.add(value)
      return { ...prev, [q.id]: Array.from(current) }
    })
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!student) return setError("Session apprenant introuvable. Recommence l'inscription.")

    for (const q of QCM_QUESTIONS) {
      const v = answers[q.id]
      const ok = q.multi ? Array.isArray(v) && v.length > 0 : Boolean(String(v || '').trim())
      if (!ok) return setError(`Question manquante: “${q.question}”`)
    }

    updateStorage(
      StorageKeys.students,
      (list) =>
        (list || []).map((s) => (s.id === student.id ? { ...s, qcm: { ...answers, completedAt: Date.now() } } : s)),
      [],
    )
    navigate('/inscription/apprenant/recommandations')
  }

  return (
    <Page
      title="QCM de profil — étape 2/2"
      subtitle="Réponds franchement, c’est juste pour te recommander des cours (démo)."
      mascotSrc="/assets/mascot_guide_section.png"
    >
      <form onSubmit={onSubmit} className="grid" style={{ gap: 16 }}>
        {!student ? (
          <div
            className="card"
            style={{
              padding: 12,
              boxShadow: 'none',
              borderColor: 'rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.08)',
            }}
          >
            <strong>Info:</strong> Cette page attend une session apprenant. Reviens à l’inscription.
          </div>
        ) : (
          <div className="muted">
            Apprenant: <strong>{student.name}</strong> — {student.email}
          </div>
        )}

        {QCM_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 900 }}>
              {idx + 1}. {q.question}
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              {q.options.map((opt) => {
                const checked = q.multi ? (answers[q.id] || []).includes(opt.value) : answers[q.id] === opt.value
                return (
                  <label
                    key={String(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: '1px solid rgba(2,38,69,0.12)',
                      background: checked ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type={q.multi ? 'checkbox' : 'radio'}
                      name={q.id}
                      checked={checked}
                      onChange={() => setAnswer(q, opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        {error ? (
          <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" type="submit">
            Voir mes recommandations
          </button>
        </div>
      </form>
    </Page>
  )
}


import React, { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge.jsx'
import { loginAsStudent, loginAsTeacher } from '../../lib/auth.js'
import { ensureAdminSession, getSession, isAdminEnabled } from '../../lib/session.js'

function Card({ children }) {
  return (
    <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
      {children}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = useMemo(() => new URLSearchParams(location.search).get('next') || '/dashboard', [location.search])

  const session = getSession()
  if (session.role !== 'guest') {
    const target = session.role === 'teacher' ? '/instructor' : session.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={target} replace />
  }

  const [tab, setTab] = useState('student')
  const [email, setEmail] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')

  function onLogin(e) {
    e.preventDefault()
    setError('')
    const res = tab === 'teacher' ? loginAsTeacher(email) : loginAsStudent(email)
    if (!res.ok) return setError(res.error)
    navigate(tab === 'teacher' ? '/instructor' : next, { replace: true })
  }

  function onAdmin(e) {
    e.preventDefault()
    setError('')
    const res = ensureAdminSession(adminCode)
    if (!res.ok) return setError("Code admin invalide. (Démo: 'admin')")
    navigate('/admin', { replace: true })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, alignItems: 'start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src="/assets/intelo_logo.png" alt="IntelliNotes" style={{ height: 95, width: 'auto', objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 950, fontSize: 26, lineHeight: 1.1 }}>IntelliNotes</div>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          Accès simple et rapide.
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
        <Card>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Se connecter</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`btn ${tab === 'student' ? 'primary' : ''}`} type="button" onClick={() => setTab('student')}>
                Apprenant
              </button>
              <button className={`btn ${tab === 'teacher' ? 'primary' : ''}`} type="button" onClick={() => setTab('teacher')}>
                Formateur
              </button>
            </div>
          </div>

          <form onSubmit={onLogin} style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <div className="field">
              <div className="label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: sara@email.com" />
              <div className="hint">Démo: pas de mot de passe. On vérifie juste l’email enregistré.</div>
            </div>

            {error ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}

            <button className="btn primary" type="submit">
              Se connecter
            </button>
            <div className="muted" style={{ fontSize: 13 }}>
              Pas de compte? <Link to="/signup" style={{ textDecoration: 'underline' }}>Inscription</Link>
            </div>
          </form>
        </Card>

        <Card>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Accès admin (démo)</div>
            <Badge color={isAdminEnabled() ? 'green' : 'gray'}>{isAdminEnabled() ? 'Activé' : 'Protégé'}</Badge>
          </div>
          <form onSubmit={onAdmin} style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="input" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="code admin" style={{ maxWidth: 260 }} />
            <button className="btn" type="submit">
              Entrer
            </button>
          </form>
          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Admin = modération (approve/reject) des cours formateurs.
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <img
          src="/assets/mascot_learning_helper.png"
          alt=""
          style={{
            width: 'min(280px, 55vw)',
            maxWidth: 320,
            height: 'auto',
            opacity: 1,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 18px 30px rgba(2,38,69,0.18))',
          }}
        />
      </div>
    </div>
  )
}

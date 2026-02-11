import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Badge from '../../components/Badge.jsx'
import { signupStudent, signupTeacher } from '../../lib/auth.js'
import { getSession } from '../../lib/session.js'

function RoleCard({ title, subtitle, mascot, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card"
      style={{
        padding: 16,
        boxShadow: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 950, fontSize: 18 }}>{title}</div>
        <div className="muted" style={{ marginTop: 6 }}>
          {subtitle}
        </div>
      </div>
      <img src={mascot} alt="" style={{ width: 70, height: 'auto', opacity: 1 }} />
    </button>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const session = getSession()
  if (session.role !== 'guest') {
    const target = session.role === 'teacher' ? '/instructor' : session.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={target} replace />
  }
  const [role, setRole] = useState(null) // student | teacher
  const [error, setError] = useState('')

  const Brand = (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <img src="/assets/intelo_logo.png" alt="IntelliNotes" style={{ height: 95, width: 'auto', objectFit: 'contain' }} />
      <div>
        <div style={{ fontWeight: 950, fontSize: 26, lineHeight: 1.1 }}>IntelliNotes</div>
        <div className="muted">Créer un compte</div>
      </div>
    </div>
  )

  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [studentRole, setStudentRole] = useState('étudiant')

  const [teacherName, setTeacherName] = useState('')
  const [teacherEmail, setTeacherEmail] = useState('')
  const [specialty, setSpecialty] = useState('Web / JS')

  function submitStudent(e) {
    e.preventDefault()
    setError('')
    const res = signupStudent({ name: studentName, email: studentEmail, studentRole })
    if (!res.ok) return setError(res.error)
    navigate('/onboarding-qcm', { replace: true })
  }

  function submitTeacher(e) {
    e.preventDefault()
    setError('')
    const res = signupTeacher({ name: teacherName, email: teacherEmail, specialty })
    if (!res.ok) return setError(res.error)
    navigate('/instructor', { replace: true })
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {Brand}
        <Badge color="gray">Inscription</Badge>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 950, fontSize: 26, lineHeight: 1.1 }}>Inscription</div>
          <div className="muted">Choisis ton rôle. Après ça, on t’accompagne خطوة بخطوة.</div>
        </div>
      </div>

      {!role ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <RoleCard
            title="Étudiant / Stagiaire"
            subtitle="Onboarding + QCM, puis dashboard."
            mascot="/assets/mascot_guide_section.png"
            onClick={() => setRole('student')}
          />
          <RoleCard
            title="Formateur"
            subtitle="Vérification (≤24h), puis espace formateur."
            mascot="/assets/mascot_business_confidence.png"
            onClick={() => setRole('teacher')}
          />
        </div>
      ) : null}

      {role === 'student' ? (
        <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Inscription apprenant</div>
            <button className="btn ghost" type="button" onClick={() => setRole(null)}>
              Changer
            </button>
          </div>
          <form onSubmit={submitStudent} style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field">
                <div className="label">Nom</div>
                <input className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Statut</div>
                <select className="select" value={studentRole} onChange={(e) => setStudentRole(e.target.value)}>
                  <option value="étudiant">Étudiant</option>
                  <option value="stagiaire">Stagiaire</option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}

            <button className="btn primary" type="submit">
              Continuer vers le QCM
            </button>
          </form>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <img src="/assets/mascot_future_vision.png" alt="" style={{ width: 220, maxWidth: '55vw', height: 'auto', opacity: 1, pointerEvents: 'none' }} />
          </div>
        </div>
      ) : null}

      {role === 'teacher' ? (
        <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Inscription formateur</div>
            <button className="btn ghost" type="button" onClick={() => setRole(null)}>
              Changer
            </button>
          </div>
          <form onSubmit={submitTeacher} style={{ marginTop: 12, display: 'grid', gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field">
                <div className="label">Nom</div>
                <input className="input" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Spécialité</div>
                <input className="input" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
              </div>
            </div>

            {error ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}

            <button className="btn success" type="submit">
              Créer mon compte formateur
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <img src="/assets/mascot_business_confidence.png" alt="" style={{ width: 220, maxWidth: '55vw', height: 'auto', opacity: 1, pointerEvents: 'none' }} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../../components/Page.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import { ensureAdminSession, getSession, isAdminEnabled, logout } from '../../lib/session.js'
import { StorageKeys, readStorage, resetAllDemoData, updateStorage } from '../../lib/storage.js'
import { useStorageValue } from '../../lib/useStorageValue.js'

function statusColor(status) {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'orange'
}

export default function AdminPage() {
  const session = getSession()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const isAdmin = session.role === 'admin' && isAdminEnabled()

  const list = useStorageValue(StorageKeys.submittedCourses, [])

  function login(e) {
    e.preventDefault()
    setError('')
    const res = ensureAdminSession(code)
    if (!res.ok) setError("Code invalide. (Démo: code = 'admin')")
  }

  function setStatus(id, status) {
    updateStorage(
      StorageKeys.submittedCourses,
      (items) =>
        (items || []).map((c) =>
          c.id === id ? { ...c, status, moderatedAt: Date.now(), moderatedBy: 'admin' } : c,
        ),
      [],
    )
  }

  function onReset() {
    resetAllDemoData()
    logout()
  }

  const pending = list.filter((c) => c.status === 'pending')
  const others = list.filter((c) => c.status !== 'pending')

  return (
    <Page
      title="Admin / Modération"
      subtitle="Démo: validation formateur + approbation des cours (pending → approved/rejected)."
      mascotSrc="/assets/mascot_guide_section.png"
    >
      {!isAdmin ? (
        <div className="grid" style={{ gap: 14 }}>
          <div
            className="card"
            style={{
              padding: 14,
              boxShadow: 'none',
              borderColor: 'rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.08)',
            }}
          >
            <strong>Accès admin (démo)</strong>
            <div className="muted" style={{ marginTop: 8 }}>
              On protège l’admin avec un code simple (prototype). Code: <strong>admin</strong>
            </div>
            <form onSubmit={login} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code admin" style={{ maxWidth: 280 }} />
              <button className="btn primary" type="submit">
                Entrer
              </button>
              <Link className="btn" to="/">
                Retour accueil
              </Link>
            </form>
            {error ? (
              <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', marginTop: 10 }}>
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="muted">
                <strong>Admin connecté.</strong> Rôle: modération des cours soumis.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn ghost" onClick={logout}>
                  Se déconnecter
                </button>
                <button className="btn danger" onClick={onReset} title="Efface uniquement le localStorage du prototype">
                  Réinitialiser démo
                </button>
              </div>
            </div>
            <div className="muted" style={{ marginTop: 10 }}>
              Règle: on vérifie que ce n’est pas quelqu’un qui essaie de scam. Après <strong>approved</strong>, le cours apparaît dans{' '}
              <Link to="/catalogue" style={{ textDecoration: 'underline' }}>
                le catalogue
              </Link>
              .
            </div>
          </div>

          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 950, marginBottom: 10 }}>Cours en attente ({pending.length})</div>
            {!pending.length ? <div className="muted">Aucun cours pending pour l’instant.</div> : null}
            <div className="grid" style={{ gap: 12 }}>
              {pending.map((c) => (
                <div key={c.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontWeight: 950 }}>{c.title}</div>
                    <Price value={c.priceDH} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
                    <Badge color={statusColor(c.status)}>{String(c.status).toUpperCase()}</Badge>
                    <Badge color="gray">{c.category}</Badge>
                    <Badge color="gray">{c.level}</Badge>
                    <Badge color="orange">Formateur: {c.teacherName}</Badge>
                  </div>
                  <div className="muted" style={{ marginTop: 10 }}>
                    <strong>Fichier:</strong> {c.file?.name || '—'} ({c.file?.type || '—'}, {c.file?.size ? Math.round(c.file.size / 1024) + ' KB' : '—'})
                    <br />
                    <strong>Email:</strong> {c.teacherEmail}
                    <br />
                    <strong>Description:</strong> {c.description}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                    <button className="btn success" onClick={() => setStatus(c.id, 'approved')}>
                      Approuver
                    </button>
                    <button className="btn danger" onClick={() => setStatus(c.id, 'rejected')}>
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ fontWeight: 950, marginBottom: 10 }}>Historique ({others.length})</div>
            {!others.length ? <div className="muted">Rien pour l’instant.</div> : null}
            <div className="grid" style={{ gap: 12 }}>
              {others.map((c) => (
                <div key={c.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontWeight: 950 }}>{c.title}</div>
                    <Badge color={statusColor(c.status)}>{String(c.status).toUpperCase()}</Badge>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {c.teacherName} • {c.category} • {c.level} • {c.priceDH} DH
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    {c.status === 'approved' ? (
                      <Link className="btn primary" to={`/cours/${c.id}`}>
                        Ouvrir cours
                      </Link>
                    ) : (
                      <button className="btn" onClick={() => setStatus(c.id, 'approved')}>
                        Re‑approuver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}

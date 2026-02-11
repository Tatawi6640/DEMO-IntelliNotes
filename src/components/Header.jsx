import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { StorageKeys } from '../lib/storage.js'
import { logout } from '../lib/session.js'
import { useStorageValue } from '../lib/useStorageValue.js'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${isActive ? 'rgba(14,165,233,0.45)' : 'rgba(2,38,69,0.12)'}`,
        background: isActive ? 'rgba(14,165,233,0.10)' : 'rgba(255,255,255,0.65)',
        color: 'inherit',
        fontWeight: 650,
        whiteSpace: 'nowrap',
      })}
    >
      {children}
    </NavLink>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const session = useStorageValue(StorageKeys.session, { role: 'guest', userId: null })

  const roleLabel =
    session.role === 'student'
      ? 'Apprenant'
      : session.role === 'teacher'
        ? 'Formateur'
        : session.role === 'admin'
          ? 'Admin'
          : 'Visiteur'

  return (
    <header style={{ padding: '14px 0 10px 0' }}>
      <div className="container">
        <div
          className="card"
          style={{
            padding: 14,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 260, flex: '1 1 520px' }}>
            <Link to="/" style={{ display: 'inline-block' }}>
              <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.15, whiteSpace: 'normal' }}>
                IntelliNotes
              </div>
            </Link>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
              }}
            >
              <NavItem to="/catalogue">Catalogue</NavItem>
              <NavItem to="/packs">Packs</NavItem>
              <NavItem to="/panier">Panier</NavItem>
              <NavItem to="/mon-apprentissage">Mon learning</NavItem>
              <NavItem to="/assistant">ITRILLo (démo)</NavItem>
              <NavItem to="/formateur/dashboard">Dashboard formateur</NavItem>
              <NavItem to="/admin">Admin</NavItem>
            </div>
          </div>

          <img
            src="/assets/intelo_logo.png"
            alt="Intelo"
            style={{
              height: 'clamp(70px, 8.5vw, 90px)',
              width: 'auto',
              maxWidth: '40vw',
              objectFit: 'contain',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span className="pill">
            <strong>Mode:</strong> {roleLabel}
          </span>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {session.role === 'guest' ? (
              <>
                <button className="btn ghost" onClick={() => navigate('/inscription/apprenant/etape-1')}>
                  Inscription apprenant
                </button>
                <button className="btn ghost" onClick={() => navigate('/inscription/formateur/etape-1')}>
                  Inscription formateur
                </button>
              </>
            ) : (
              <button className="btn ghost" onClick={logout}>
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

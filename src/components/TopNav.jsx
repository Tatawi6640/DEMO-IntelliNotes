import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { StorageKeys } from '../lib/storage.js'
import { logout } from '../lib/session.js'
import { useStorageValue } from '../lib/useStorageValue.js'

function LinkItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '10px 12px',
        borderRadius: 12,
        color: isActive ? '#0b4a6f' : '#0f172a',
        background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent',
        fontWeight: 750,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      })}
    >
      {children}
    </NavLink>
  )
}

export default function TopNav() {
  const navigate = useNavigate()
  const session = useStorageValue(StorageKeys.session, { role: 'guest', userId: null })
  const cart = useStorageValue(StorageKeys.cart, { items: [] })
  const cartCount = (cart?.items || []).length
  const teachers = useStorageValue(StorageKeys.teachers, [])
  const teacher = session.role === 'teacher' ? (teachers || []).find((t) => t.id === session.userId) : null
  const teacherApproved = teacher?.verificationStatus === 'approved'

  const links =
    session.role === 'student'
      ? [
          { to: '/dashboard', label: 'Mes cours' },
          { to: '/catalog', label: 'Catalogue' },
          { to: '/cart', label: `Panier${cartCount ? ` (${cartCount})` : ''}` },
        ]
      : session.role === 'teacher'
        ? [
            { to: '/instructor', label: teacherApproved ? 'Formateur' : 'Vérification' },
            ...(teacherApproved ? [{ to: '/catalog', label: 'Catalogue' }, { to: '/ai', label: 'Assistant' }] : []),
          ]
        : session.role === 'admin'
          ? [
              { to: '/admin', label: 'Admin' },
              { to: '/catalog', label: 'Catalogue' },
              { to: '/ai', label: 'Assistant' },
            ]
          : []

  return (
    <header className="topNav">
      <div className="container topNavInner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img
            src="/assets/intelo_logo.png"
            alt="IntelliNotes"
            style={{
              height: 95,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <div style={{ fontWeight: 950, letterSpacing: 0.2, fontSize: 18 }}>IntelliNotes</div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {links.map((l) => (
            <LinkItem key={l.to} to={l.to}>
              {l.label}
            </LinkItem>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          {session.role === 'guest' ? (
            <>
              <button className="btn ghost" onClick={() => navigate('/login')}>
                Se connecter
              </button>
              <button className="btn primary" onClick={() => navigate('/signup')}>
                Inscription
              </button>
            </>
          ) : (
            <button className="btn ghost" onClick={() => logout()}>
              Se déconnecter
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession, isAdminEnabled } from '../lib/session.js'

export default function RequireAuth({ role, roles, children }) {
  const location = useLocation()
  const session = getSession()

  if (session.role === 'guest') {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  const home = session.role === 'teacher' ? '/instructor' : session.role === 'admin' ? '/admin' : '/dashboard'

  if (Array.isArray(roles) && roles.length) {
    if (!roles.includes(session.role)) return <Navigate to={home} replace />
  }

  if (role === 'admin') {
    if (session.role !== 'admin' || !isAdminEnabled()) return <Navigate to="/login" replace />
  } else if (role && session.role !== role) {
    return <Navigate to={home} replace />
  }

  return children
}

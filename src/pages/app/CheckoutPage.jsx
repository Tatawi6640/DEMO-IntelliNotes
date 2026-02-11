import React, { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { StorageKeys, readStorage, updateStorage } from '../../lib/storage.js'
import { cartTotals } from '../../lib/commerce.js'
import { clearCart } from '../../lib/cart.js'
import { getSession } from '../../lib/session.js'
import { makeId } from '../../lib/id.js'
import { enrollInCourse } from '../../lib/enrollment.js'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const session = getSession()
  const isStudent = session.role === 'student'

  if (!isStudent) return <Navigate to="/dashboard" replace />

  const cart = readStorage(StorageKeys.cart, { items: [] })
  const { resolved, totalDH } = useMemo(() => cartTotals(cart.items || []), [cart.items])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState('Carte (démo)')
  const [error, setError] = useState('')

  if (!resolved.length) {
    return (
      <div className="grid" style={{ gap: 14 }}>
        <PageTitle title="Checkout" subtitle="Panier vide." />
        <EmptyState
          title="Ajoute un cours avant de payer"
          description="Retourne au catalogue."
          mascotSrc="/assets/mascot.png"
          action={
            <Link to="/catalog" className="btn primary">
              Catalogue
            </Link>
          }
        />
      </div>
    )
  }

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) return setError('Nom requis.')
    if (!email.trim() || !email.includes('@')) return setError('Email valide requis.')

    const purchase = {
      id: makeId('purchase'),
      userId: session.userId,
      items: cart.items || [],
      totalDH,
      checkout: { fullName: fullName.trim(), email: email.trim().toLowerCase(), method },
      createdAt: Date.now(),
    }
    updateStorage(StorageKeys.purchases, (list) => [...(list || []), purchase], [])

    for (const it of cart.items || []) {
      if (it.type === 'course') enrollInCourse(session.userId, it.id)
    }
    clearCart()
    navigate('/checkout/success', { replace: true })
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Checkout"
        subtitle="Paiement simulé — après validation, tu retrouves tes cours dans “Mes cours”."
        right={<Badge color="green">Total: {totalDH} DH</Badge>}
      />

      <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontWeight: 950 }}>À payer</div>
          <Price value={totalDH} style={{ fontSize: 16 }} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="card" style={{ padding: 16, boxShadow: 'none' }}>
        <MascotAside mascotSrc="/assets/mascot_business_confidence.png" mascotAlt="" mascotWidth={160} align="center">
          <div className="grid" style={{ gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div className="field">
                <div className="label">Nom complet</div>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <div className="label">Méthode</div>
                <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>Carte (démo)</option>
                  <option>Virement (démo)</option>
                  <option>Cash (démo)</option>
                </select>
              </div>
            </div>

            {error ? (
              <div
                className="card"
                style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}
              >
                <strong>Erreur:</strong> {error}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn success" type="submit">
                Payer (simulation)
              </button>
              <Link to="/cart" className="btn ghost">
                Retour panier
              </Link>
            </div>
          </div>
        </MascotAside>
      </form>
    </div>
  )
}

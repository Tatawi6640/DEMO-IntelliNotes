import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Price from '../components/Price.jsx'
import { StorageKeys, readStorage, updateStorage } from '../lib/storage.js'
import { clearCart } from '../lib/cart.js'
import { cartTotals } from '../lib/commerce.js'
import { getSession } from '../lib/session.js'
import { makeId } from '../lib/id.js'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const session = getSession()
  const cart = readStorage(StorageKeys.cart, { items: [] })
  const { resolved, totalDH } = useMemo(() => cartTotals(cart.items || []), [cart.items])

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState('Carte (démo)')
  const [error, setError] = useState('')

  const isStudent = session.role === 'student' && !!session.userId

  function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!resolved.length) return setError('Panier vide.')
    if (!isStudent) return setError('Connecte-toi en apprenant (inscription) pour finaliser.')
    if (!fullName.trim()) return setError('Nom requis.')
    if (!email.trim() || !email.includes('@')) return setError('Email valide requis.')

    const purchase = {
      id: makeId('purchase'),
      userId: session.userId,
      items: cart.items || [],
      totalDH,
      checkout: { fullName: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), method },
      createdAt: Date.now(),
    }
    updateStorage(StorageKeys.purchases, (list) => [...(list || []), purchase], [])
    clearCart()
    navigate('/checkout/success')
  }

  return (
    <Page
      title="Checkout (simulation)"
      subtitle="Formulaire fake + écran succès. Le but: tester le flow e‑learning."
      mascotSrc="/assets/mascot_conclusion_signature.png"
    >
      {!resolved.length ? (
        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <strong>Panier vide.</strong> Va au <Link to="/catalogue" style={{ textDecoration: 'underline' }}>catalogue</Link>.
        </div>
      ) : null}

      {!isStudent ? (
        <div
          className="card"
          style={{
            padding: 14,
            boxShadow: 'none',
            borderColor: 'rgba(245,158,11,0.35)',
            background: 'rgba(245,158,11,0.08)',
            marginTop: 12,
          }}
        >
          <strong>Info:</strong> Pour que l’achat apparaisse dans “Mon learning”, inscris-toi en apprenant.
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <Link to="/inscription/apprenant/etape-1" className="btn primary">
              Inscription apprenant
            </Link>
            <Link to="/panier" className="btn">
              Retour panier
            </Link>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: 14, boxShadow: 'none', marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ fontWeight: 900 }}>Total à payer (démo)</div>
          <Price value={totalDH} style={{ fontSize: 16 }} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid" style={{ gap: 14, marginTop: 12 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="field">
            <div className="label">Nom complet</div>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Yassine B." />
          </div>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: yassine@email.com" />
          </div>
          <div className="field">
            <div className="label">Téléphone (optionnel)</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 06xxxxxxxx" />
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
          <div className="card" style={{ padding: 12, boxShadow: 'none', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }}>
            <strong>Erreur:</strong> {error}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn success" type="submit">
            Payer (simulation) & Valider
          </button>
          <Link className="btn" to="/panier">
            Retour panier
          </Link>
        </div>
      </form>
    </Page>
  )
}


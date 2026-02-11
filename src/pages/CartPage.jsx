import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'
import Price from '../components/Price.jsx'
import { StorageKeys } from '../lib/storage.js'
import { useStorageValue } from '../lib/useStorageValue.js'
import { cartTotals, resolveCartItem } from '../lib/commerce.js'
import { removeFromCart } from '../lib/cart.js'

export default function CartPage() {
  const navigate = useNavigate()
  const cart = useStorageValue(StorageKeys.cart, { items: [] })

  const { resolved, totalDH } = useMemo(() => cartTotals(cart.items || []), [cart.items])

  return (
    <Page title="Panier" subtitle="Simulation: ajoute/supprime, puis checkout (fake)." mascotSrc="/assets/mascot_conclusion_signature.png">
      {!resolved.length ? (
        <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
          <div style={{ fontWeight: 900 }}>Ton panier est vide.</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Va au catalogue ou packs et ajoute ce qui t’intéresse.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="btn primary" to="/catalogue">
              Catalogue
            </Link>
            <Link className="btn" to="/packs">
              Packs
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid" style={{ gap: 14, marginTop: 12 }}>
        {resolved.map((it) => (
          <div key={`${it.type}:${it.id}`} className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950 }}>{it.title}</div>
              <Price value={it.priceDH} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              <Badge color={it.type === 'pack' ? 'green' : 'blue'}>{it.type === 'pack' ? 'Pack' : 'Cours'}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn danger" onClick={() => removeFromCart({ type: it.type, id: it.id })}>
                Retirer
              </button>
              <Link className="btn" to={it.type === 'course' ? `/cours/${it.id}` : '/packs'}>
                Voir détails
              </Link>
            </div>
          </div>
        ))}

        {resolved.length ? (
          <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950 }}>Total</div>
              <Price value={totalDH} style={{ fontSize: 16 }} />
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              Checkout = simulation (aucun paiement réel).
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn success" onClick={() => navigate('/checkout')}>
                Passer au checkout
              </button>
              <Link className="btn" to="/catalogue">
                Continuer mes achats
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </Page>
  )
}


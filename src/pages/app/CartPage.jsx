import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Badge from '../../components/Badge.jsx'
import Price from '../../components/Price.jsx'
import CourseCover from '../../components/CourseCover.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { StorageKeys } from '../../lib/storage.js'
import { useStorageValue } from '../../lib/useStorageValue.js'
import { cartTotals } from '../../lib/commerce.js'
import { removeFromCart } from '../../lib/cart.js'

export default function CartPage() {
  const navigate = useNavigate()
  const cart = useStorageValue(StorageKeys.cart, { items: [] })
  const { resolved, totalDH } = useMemo(() => cartTotals(cart.items || []), [cart.items])

  if (!resolved.length) {
    return (
      <div className="grid" style={{ gap: 14 }}>
        <PageTitle title="Panier" subtitle="Ajoute des cours puis passe au checkout." />
        <EmptyState
          title="Ton panier est vide"
          description="Explore le catalogue et ajoute un cours."
          mascotSrc="/assets/mascot_learning_helper.png"
          action={
            <Link to="/catalog" className="btn primary">
              Aller au catalogue
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Panier"
        subtitle="Vérifie tes cours, puis checkout (simulation)."
        right={<Badge color="green">{resolved.length} item(s)</Badge>}
      />

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
        {resolved.map((it) => (
          <div key={`${it.type}:${it.id}`} className="card" style={{ padding: 14, boxShadow: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center' }}>
              <CourseCover src={it.meta?.cover} label={it.meta?.category} height={90} />
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontWeight: 950 }}>{it.title}</div>
                  <Price value={it.priceDH} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge color="blue">{it.meta?.category || 'Cours'}</Badge>
                  <Badge color="gray">{it.meta?.level || 'Niveau'}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn danger" onClick={() => removeFromCart({ type: it.type, id: it.id })}>
                    Retirer
                  </button>
                  <Link className="btn ghost" to={`/course/${it.id}`}>
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
        <MascotAside mascotSrc="/assets/mascot_conclusion_signature.png" mascotAlt="" mascotWidth={150} align="center">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Total</div>
              <Price value={totalDH} style={{ fontSize: 16 }} />
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              Checkout = simulation (aucun paiement réel).
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn success" onClick={() => navigate('/checkout')}>
                Passer au checkout
              </button>
              <Link to="/catalog" className="btn ghost">
                Continuer mes achats
              </Link>
            </div>
          </div>
        </MascotAside>
      </div>
    </div>
  )
}

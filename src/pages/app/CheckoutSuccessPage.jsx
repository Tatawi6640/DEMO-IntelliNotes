import React from 'react'
import { Link } from 'react-router-dom'
import PageTitle from '../../components/PageTitle.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function CheckoutSuccessPage() {
  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle title="Paiement validé" subtitle="Simulation OK. Tes cours sont ajoutés à “Mes cours”." />
      <EmptyState
        title="Merci!"
        description="Aucun paiement réel n’a été effectué (démo)."
        mascotSrc="/assets/mascot_conclusion_signature.png"
        action={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn success">
              Aller à Mes cours
            </Link>
            <Link to="/catalog" className="btn ghost">
              Retour catalogue
            </Link>
          </div>
        }
      />
    </div>
  )
}


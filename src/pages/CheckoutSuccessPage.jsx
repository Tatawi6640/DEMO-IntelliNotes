import React from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'

export default function CheckoutSuccessPage() {
  return (
    <Page
      title="Paiement validé (simulation)"
      subtitle="Bravo! Les éléments achetés sont maintenant dans “Mon learning” (si tu étais en mode apprenant)."
      mascotSrc="/assets/mascot_conclusion_signature.png"
    >
      <div className="card" style={{ padding: 14, boxShadow: 'none' }}>
        <div style={{ fontWeight: 950 }}>Succès ✅</div>
        <div className="muted" style={{ marginTop: 8 }}>
          Aucun paiement réel n’a été effectué. C’est juste un flow UX.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <Link to="/mon-apprentissage" className="btn success">
          Aller à Mon learning
        </Link>
        <Link to="/catalogue" className="btn">
          Retour catalogue
        </Link>
      </div>
    </Page>
  )
}


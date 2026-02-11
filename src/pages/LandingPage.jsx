import React from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'
import Badge from '../components/Badge.jsx'

export default function LandingPage() {
  return (
    <Page
      title="Bienvenue sur IntelliNotes"
      subtitle="Une plateforme e‑learning (démo) pour apprendre, acheter des packs, et suivre ton progrès — tout en localStorage."
      mascotSrc="/assets/mascot_guide_section.png"
    >
      <div className="grid" style={{ gap: 16 }}>
        <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <Badge color="green">100% local</Badge>
            <Badge color="blue">Catalogue + packs</Badge>
            <Badge color="orange">Formateurs (pending → admin)</Badge>
            <Badge color="gray">Chatbot règle‑based (pas IA)</Badge>
          </div>
          <p className="muted" style={{ margin: '12px 0 0 0' }}>
            Salam! Ici c’est une démo: pas de vrai paiement, pas de vrai upload serveur, pas d’IA. Mais l’expérience UI est
            là, b‑lkhir.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
          <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
            <h2 style={{ margin: 0 }}>Commencer</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Choisis ton parcours:
            </p>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <Link to="/inscription/apprenant/etape-1" className="btn primary" style={{ padding: 16, fontSize: 16 }}>
                Inscription Apprenant (étudiant/stagiaire)
              </Link>
              <Link to="/inscription/formateur/etape-1" className="btn success" style={{ padding: 16, fontSize: 16 }}>
                Inscription Formateur
              </Link>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18, boxShadow: 'none' }}>
          <h2 style={{ margin: 0 }}>Raccourcis</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="btn" to="/catalogue">
              Voir le catalogue
            </Link>
            <Link className="btn" to="/packs">
              Voir les packs
            </Link>
            <Link className="btn" to="/admin">
              Modération admin (démo)
            </Link>
          </div>
        </div>
      </div>
    </Page>
  )
}


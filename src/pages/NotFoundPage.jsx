import React from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page.jsx'

export default function NotFoundPage() {
  return (
    <Page title="Oups… page introuvable" subtitle="Retourne à l’accueil, wla dir refresh." mascotSrc="/assets/mascot.png">
      <p className="muted">Cette route n’existe pas dans le prototype.</p>
      <Link to="/" className="btn primary">
        Revenir à l’accueil
      </Link>
    </Page>
  )
}


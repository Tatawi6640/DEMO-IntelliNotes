# IntelliNotes — Prototype React (v1.1)

Prototype UI de la plateforme e‑learning **IntelliNotes** (FR avec une touche darija), construit avec **React + Vite**.

## Prérequis
- Node.js 18+ (recommandé)
- npm

## Installation
```bash
npm install
```

### Si tu vois une erreur Rollup (optional dependency)
Si `npm run dev` ou `npm run build` échoue avec un message du style `Cannot find module @rollup/rollup-...`, fais un clean install:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Lancer en dev
```bash
npm run dev
```
Puis ouvre l’URL affichée (souvent `http://localhost:5173`).

## Build (production)
```bash
npm run build
```

## Preview du build
```bash
npm run preview
```

## Ce qui est mocké (important)
- **Backend**: aucun serveur. Tout est stocké dans **localStorage**.
- **Paiement**: checkout 100% simulation (aucune transaction réelle).
- **Upload formateur**: aucun upload serveur — on stocke uniquement les **métadonnées** du fichier (nom, taille, type…).
- **Chatbot**: **pas une IA**. Réponses basées sur une **FAQ hardcodée + liste de cours** et des règles simples.
- **Admin**: accès démo via code `admin`.

## Données & localStorage
Toutes les clés sont préfixées avec:
- `intellinotes.v1_1.`

Principales clés utilisées:
- `intellinotes.v1_1.session` (session démo: guest/student/teacher/admin)
- `intellinotes.v1_1.students` (inscriptions apprenants + QCM)
- `intellinotes.v1_1.teachers` (inscriptions formateurs)
- `intellinotes.v1_1.submittedCourses` (cours soumis par formateurs + statut pending/approved/rejected)
- `intellinotes.v1_1.cart` (panier)
- `intellinotes.v1_1.purchases` (achats simulés)
- `intellinotes.v1_1.progress` (progression “Mon learning”)

### Reset (repartir de zéro)
Option 1: via l’UI
- Va sur `#/admin`, connecte-toi (code `admin`), puis clique **Réinitialiser démo**.

Option 2: via le navigateur
- DevTools → Application → Local Storage → supprimer les clés `intellinotes.v1_1.*`.

## Assets
Les PNG sont servis depuis:
- `public/assets/`

Ils ont été **copiés** depuis le dossier parent (originaux inchangés).

## Datasets
- Cours initiaux: `src/data/courses.json` (≥ 12 cours)

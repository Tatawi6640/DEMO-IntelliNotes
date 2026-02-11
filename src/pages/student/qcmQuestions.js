export const QCM_QUESTIONS = [
  {
    id: 'experienceLevel',
    question: "Ton niveau global (sans stress) ?",
    options: [
      { value: 'Débutant', label: 'Débutant (je commence)' },
      { value: 'Intermédiaire', label: "Intermédiaire (je pratique déjà)" },
      { value: 'Avancé', label: 'Avancé (je veux du challenge)' },
    ],
  },
  {
    id: 'goals',
    question: "Ton objectif principal ? (choix multiple)",
    multi: true,
    options: [
      { value: 'web', label: 'Web / Front‑end' },
      { value: 'data', label: 'Data / Analyse / ML' },
      { value: 'ai', label: 'IA / Deep Learning (DL)' },
    ],
  },
  {
    id: 'preferredLanguage',
    question: 'Langue préférée pour apprendre ?',
    options: [
      { value: 'fr', label: 'Français' },
      { value: 'mix', label: 'Mix FR + Darija (bshwiya)' },
      { value: 'darija', label: 'Darija (plus simple)' },
    ],
  },
  {
    id: 'availability',
    question: 'Disponibilité hebdomadaire ?',
    options: [
      { value: '2h', label: '2h / semaine' },
      { value: '5h', label: '5h / semaine' },
      { value: '10h', label: '10h+ / semaine' },
    ],
  },
  {
    id: 'learningStyle',
    question: 'Tu préfères apprendre comment ?',
    options: [
      { value: 'video', label: 'Vidéos + démos' },
      { value: 'reading', label: 'Lecture / notes structurées' },
      { value: 'practice', label: 'Pratique (exercices / mini projets)' },
    ],
  },
  {
    id: 'topics',
    question: 'Quels sujets t’intéressent ? (choix multiple)',
    multi: true,
    options: [
      { value: 'frontend', label: 'Frontend (HTML/CSS/JS)' },
      { value: 'ml', label: 'Machine Learning (ML)' },
      { value: 'dl', label: 'Deep Learning (DL)' },
      { value: 'career', label: 'Orientation carrière + CV' },
    ],
  },
  {
    id: 'motivation',
    question: 'Pourquoi tu apprends maintenant ?',
    options: [
      { value: 'job', label: 'Trouver un job / stage' },
      { value: 'upgrade', label: 'Monter en compétences' },
      { value: 'project', label: 'Construire un projet perso' },
    ],
  },
  {
    id: 'device',
    question: 'Tu apprends plutôt sur…',
    options: [
      { value: 'laptop', label: 'PC/Laptop' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'both', label: 'Les deux' },
    ],
  },
  {
    id: 'pace',
    question: 'Ton rythme préféré ?',
    options: [
      { value: 'slow', label: 'Calme, étape par étape' },
      { value: 'normal', label: 'Normal' },
      { value: 'fast', label: 'Rapide, direct au but' },
    ],
  },
  {
    id: 'support',
    question: 'Tu veux quel type d’aide ?',
    options: [
      { value: 'faq', label: 'FAQ + plans de cours' },
      { value: 'coach', label: 'Feedback sur exercices (mock)' },
      { value: 'community', label: 'Communauté / discussions (mock)' },
    ],
  },
  {
    id: 'targetCategory',
    question: 'Catégorie prioritaire pour commencer ?',
    options: [
      { value: 'HTML', label: 'HTML' },
      { value: 'CSS', label: 'CSS' },
      { value: 'JavaScript', label: 'JavaScript' },
      { value: 'Machine Learning (ML)', label: 'Machine Learning (ML)' },
      { value: 'Deep Learning (DL)', label: 'Deep Learning (DL)' },
    ],
  },
  {
    id: 'budget',
    question: 'Budget par cours (max) ?',
    options: [
      { value: 100, label: '≤ 100 DH' },
      { value: 200, label: '≤ 200 DH' },
      { value: 500, label: '≤ 500 DH' },
    ],
  }
]


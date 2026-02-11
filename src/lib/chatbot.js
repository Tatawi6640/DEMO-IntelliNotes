import { FAQ } from '../data/faq.js'
import { getAllCourses } from './catalog.js'
import { formatDH } from './currency.js'
import { normalizeText } from './text.js'

function detectCategory(message) {
  const m = ` ${normalizeText(message)} `
  if (m.includes('html')) return 'HTML'
  if (m.includes('css')) return 'CSS'
  if (m.includes('javascript') || m.includes(' js ')) return 'JavaScript'
  if (m.includes('machine learning') || m.includes(' ml ')) return 'Machine Learning (ML)'
  if (m.includes('deep learning') || m.includes(' dl ')) return 'Deep Learning (DL)'
  return null
}

function findCourseMention(message) {
  const m = normalizeText(message)
  const courses = getAllCourses()
  const directById = courses.find((c) => m.includes(normalizeText(c.id)))
  if (directById) return directById

  const tokens = m.split(' ').filter(Boolean)
  const isUseful = (t) => t.length >= 4 && !['cours', 'prix', 'pack', 'packs'].includes(t)

  let best = null
  let bestScore = 0
  for (const c of courses) {
    const ct = normalizeText(c.title)
    let score = 0
    for (const t of tokens) {
      if (!isUseful(t)) continue
      if (ct.includes(t)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }
  return bestScore >= 2 ? best : null
}

function answerFromFaq(message) {
  const m = normalizeText(message)
  const match = FAQ.find((item) => item.q.some((k) => m.includes(normalizeText(k))))
  return match ? match.a : null
}

export function replyTo(message) {
  const raw = String(message || '').trim()
  if (!raw) return "Vas‑y, écris ta question 🙂 (FAQ + cours seulement, wach?)"

  const m = ` ${normalizeText(raw)} `
  const courses = getAllCourses()

  const faq = answerFromFaq(raw)
  if (faq) return faq

  const wantsPrice = m.includes('prix') || m.includes('combien') || m.includes('tarif')
  const category = detectCategory(raw)
  const mention = findCourseMention(raw)

  if (wantsPrice) {
    if (mention) return `Le prix de “${mention.title}” est ${formatDH(mention.priceDH)}.`
    if (category) {
      const matches = courses.filter((c) => c.category === category).slice(0, 6)
      if (!matches.length) return `Je trouve pas de cours dans ${category} pour l’instant.`
      return `Prix pour ${category}:\n- ${matches.map((c) => `${c.title} (${formatDH(c.priceDH)})`).join('\n- ')}`
    }
    const min = Math.min(...courses.map((c) => Number(c.priceDH || 0)))
    const max = Math.max(...courses.map((c) => Number(c.priceDH || 0)))
    return `Les cours sont entre ${formatDH(min)} et ${formatDH(max)}. Dis-moi le titre ou la catégorie (HTML/CSS/JS/ML/DL).`
  }

  const wantsCourses = m.includes('cours') || m.includes('catalogue') || m.includes('liste')
  const mentionsMl = m.includes(' ml ') || m.includes('machine learning')
  const mentionsDl = m.includes(' dl ') || m.includes('deep learning')

  if (mentionsMl || mentionsDl) {
    const wanted = mentionsDl ? 'Deep Learning (DL)' : 'Machine Learning (ML)'
    const matches = courses.filter((c) => c.category === wanted).slice(0, 6)
    if (!matches.length) return `Je trouve pas de ${wanted} pour l’instant.`
    return `Suggestions ${wanted}:\n- ${matches.map((c) => `${c.title} (${formatDH(c.priceDH)})`).join('\n- ')}`
  }

  if (wantsCourses && category) {
    const matches = courses.filter((c) => c.category === category).slice(0, 8)
    if (!matches.length) return `Je trouve pas de cours dans ${category} pour l’instant.`
    return `Cours ${category} disponibles:\n- ${matches.map((c) => `${c.title} (${formatDH(c.priceDH)})`).join('\n- ')}`
  }

  return 'Je peux répondre فقط على الأسئلة اللي كنعرف (FAQ + cours). Essaie: “cours HTML”, “cours ML”, “remboursement”, “devenir formateur”.'
}

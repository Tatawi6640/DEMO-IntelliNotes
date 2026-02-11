import baseCourses from '../data/courses.json'
import { readStorage, StorageKeys } from './storage.js'

export const COURSE_CATEGORIES = ['HTML', 'CSS', 'JavaScript', 'Machine Learning (ML)', 'Deep Learning (DL)']
export const COURSE_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']

function normalizeCategory(category) {
  const c = String(category || '').trim()
  if (c === 'ML' || c.toLowerCase() === 'machine learning') return 'Machine Learning (ML)'
  if (c === 'DL' || c.toLowerCase() === 'deep learning') return 'Deep Learning (DL)'
  return c
}

export function coverForCategory(category) {
  const c = normalizeCategory(category)
  if (c === 'HTML') return '/assets/HTML.png'
  if (c === 'CSS') return '/assets/CSS.png'
  if (c === 'JavaScript' || c === 'JS') return '/assets/JavaScript.png'
  if (String(c).includes('Machine Learning') || c === 'ML') return '/assets/Machine_Learning.png'
  if (String(c).includes('Deep Learning') || c === 'DL') return '/assets/Deep_Learning.png'
  return null
}

export function getApprovedTeacherCourses() {
  const submitted = readStorage(StorageKeys.submittedCourses, [])
  return submitted
    .filter((c) => c.status === 'approved')
    .map((c) => ({
      id: c.id,
      title: c.title,
      category: normalizeCategory(c.category),
      level: c.level || 'Débutant',
      cover: c.cover || coverForCategory(c.category),
      priceDH: Number(c.priceDH || 0),
      tags: c.tags || [],
      shortDescription: c.shortDescription || (c.description ? String(c.description).slice(0, 120) + '…' : 'Cours proposé par un formateur (vérifié).'),
      description: c.description || 'Cours proposé par un formateur (vérifié).',
      whatYouLearn: c.whatYouLearn || ['Objectifs clairs', 'Exemples guidés', 'Exercices pratiques'],
      plan: c.plan || ['Introduction', 'Partie 1', 'Partie 2', 'Conclusion'],
      exercises: c.exercises || ['Mini‑projet', 'QCM rapide', 'Exercice pratique'],
      qcm: c.qcm || [],
      author: c.teacherName || 'Formateur',
      source: 'teacher',
    }))
}

export function getAllCourses() {
  return [
    ...baseCourses.map((c) => ({ ...c, cover: c.cover || coverForCategory(c.category), source: 'base' })),
    ...getApprovedTeacherCourses(),
  ]
}

export function getCourseById(courseId) {
  return getAllCourses().find((c) => c.id === courseId) || null
}

export function getAllPacks() {
  return []
}

export function getPackById() {
  return null
}

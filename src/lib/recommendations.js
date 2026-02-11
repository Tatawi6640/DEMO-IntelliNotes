import { getAllCourses } from './catalog.js'

function scoreCourse(course, profile) {
  let score = 0
  const goals = new Set(profile.goals || [])
  const topics = new Set(profile.topics || [])
  const level = profile.level || 'Débutant'
  const targetCategory = profile.targetCategory

  const category = String(course.category || '')
  if (goals.has('web') && ['HTML', 'CSS', 'JavaScript'].includes(category)) score += 4
  if (goals.has('data') && category.includes('ML')) score += 4
  if (goals.has('ai') && category.includes('DL')) score += 4
  if (topics.has('frontend') && ['HTML', 'CSS', 'JavaScript'].includes(category)) score += 2
  if (topics.has('ml') && category.includes('ML')) score += 2
  if (topics.has('dl') && category.includes('DL')) score += 2

  if (level === course.level) score += 3
  if (level === 'Débutant' && course.level === 'Débutant') score += 1
  if (targetCategory && category === targetCategory) score += 3
  return score
}

export function recommendCourses(qcmAnswers) {
  const courses = getAllCourses()
  const profile = {
    level: qcmAnswers.experienceLevel,
    goals: qcmAnswers.goals || [],
    topics: qcmAnswers.topics || [],
    targetCategory: qcmAnswers.targetCategory,
  }
  return courses
    .map((c) => ({ course: c, score: scoreCourse(c, profile) }))
    .sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title))
    .slice(0, 6)
    .map((x) => x.course)
}

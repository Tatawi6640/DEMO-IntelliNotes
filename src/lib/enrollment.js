import { readStorage, StorageKeys, updateStorage } from './storage.js'

export function getEnrollmentsByUser(userId) {
  const all = readStorage(StorageKeys.enrollments, {})
  return all?.[userId] || []
}

export function isEnrolled(userId, courseId) {
  return getEnrollmentsByUser(userId).includes(courseId)
}

export function enrollInCourse(userId, courseId) {
  return updateStorage(
    StorageKeys.enrollments,
    (all) => {
      const next = { ...(all || {}) }
      const list = Array.isArray(next[userId]) ? next[userId] : []
      if (!list.includes(courseId)) next[userId] = [...list, courseId]
      return next
    },
    {},
  )
}

export function unenrollCourse(userId, courseId) {
  return updateStorage(
    StorageKeys.enrollments,
    (all) => {
      const next = { ...(all || {}) }
      const list = Array.isArray(next[userId]) ? next[userId] : []
      next[userId] = list.filter((id) => id !== courseId)
      return next
    },
    {},
  )
}


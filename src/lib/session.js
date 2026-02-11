import { readStorage, StorageKeys, updateStorage, writeStorage } from './storage.js'

export function getSession() {
  return readStorage(StorageKeys.session, { role: 'guest', userId: null })
}

export function setSession(nextSession) {
  writeStorage(StorageKeys.session, nextSession)
}

export function logout() {
  setSession({ role: 'guest', userId: null })
}

export function ensureAdminSession(code) {
  const ok = String(code || '').trim().toLowerCase() === 'admin'
  if (!ok) return { ok: false }
  writeStorage(StorageKeys.admin, { ok: true, at: Date.now() })
  setSession({ role: 'admin', userId: 'admin' })
  return { ok: true }
}

export function isAdminEnabled() {
  const admin = readStorage(StorageKeys.admin, { ok: false })
  return !!admin?.ok
}

export function getCurrentUser() {
  const session = getSession()
  if (session.role === 'student') {
    const students = readStorage(StorageKeys.students, [])
    return students.find((s) => s.id === session.userId) || null
  }
  if (session.role === 'teacher') {
    const teachers = readStorage(StorageKeys.teachers, [])
    return teachers.find((t) => t.id === session.userId) || null
  }
  return null
}

export function getStudentPurchases(studentId) {
  const purchases = readStorage(StorageKeys.purchases, [])
  return purchases.filter((p) => p.userId === studentId)
}

export function getAllPurchases() {
  return readStorage(StorageKeys.purchases, [])
}

export function upsertProgress(itemKey, value) {
  return updateStorage(
    StorageKeys.progress,
    (current) => ({ ...(current || {}), [itemKey]: Math.max(0, Math.min(100, Math.round(value))) }),
    {},
  )
}


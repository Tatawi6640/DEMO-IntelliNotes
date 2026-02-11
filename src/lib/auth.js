import { makeId } from './id.js'
import { readStorage, StorageKeys, updateStorage } from './storage.js'
import { setSession } from './session.js'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function loginAsStudent(email) {
  const e = normalizeEmail(email)
  const students = readStorage(StorageKeys.students, [])
  const found = students.find((s) => s.email === e)
  if (!found) return { ok: false, error: "Aucun compte apprenant avec cet email." }
  setSession({ role: 'student', userId: found.id })
  return { ok: true, user: found }
}

export function loginAsTeacher(email) {
  const e = normalizeEmail(email)
  const teachers = readStorage(StorageKeys.teachers, [])
  const found = teachers.find((t) => t.email === e)
  if (!found) return { ok: false, error: "Aucun compte formateur avec cet email." }
  setSession({ role: 'teacher', userId: found.id })
  return { ok: true, user: found }
}

export function signupStudent({ name, email, studentRole }) {
  const e = normalizeEmail(email)
  if (!name?.trim()) return { ok: false, error: 'Nom requis.' }
  if (!e || !e.includes('@')) return { ok: false, error: 'Email valide requis.' }
  if (!['étudiant', 'stagiaire'].includes(studentRole)) return { ok: false, error: 'Rôle apprenant invalide.' }

  const students = readStorage(StorageKeys.students, [])
  if (students.some((s) => s.email === e)) return { ok: false, error: 'Email déjà utilisé (apprenant).' }

  const student = {
    id: makeId('student'),
    name: name.trim(),
    email: e,
    studentRole,
    qcm: null,
    createdAt: Date.now(),
  }
  updateStorage(StorageKeys.students, (list) => [...(list || []), student], [])
  setSession({ role: 'student', userId: student.id })
  return { ok: true, user: student }
}

export function signupTeacher({ name, email, specialty }) {
  const e = normalizeEmail(email)
  if (!name?.trim()) return { ok: false, error: 'Nom requis.' }
  if (!e || !e.includes('@')) return { ok: false, error: 'Email valide requis.' }
  if (!specialty?.trim()) return { ok: false, error: 'Spécialité requise.' }

  const teachers = readStorage(StorageKeys.teachers, [])
  if (teachers.some((t) => t.email === e)) return { ok: false, error: 'Email déjà utilisé (formateur).' }

  const teacher = {
    id: makeId('teacher'),
    name: name.trim(),
    email: e,
    specialty: specialty.trim(),
    verificationStatus: 'required', // required | pending | approved | rejected
    verificationDoc: null,
    verificationSubmittedAt: null,
    verificationReviewDueAt: null,
    createdAt: Date.now(),
  }
  updateStorage(StorageKeys.teachers, (list) => [...(list || []), teacher], [])
  setSession({ role: 'teacher', userId: teacher.id })
  return { ok: true, user: teacher }
}

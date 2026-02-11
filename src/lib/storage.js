const PREFIX = 'intellinotes.v1_1.'

function key(k) {
  return `${PREFIX}${k}`
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function readStorage(k, fallback) {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key(k))
  if (raw == null) return fallback
  return safeParse(raw, fallback)
}

export function writeStorage(k, value) {
  window.localStorage.setItem(key(k), JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('intellinotes-storage', { detail: { key: k } }))
}

export function updateStorage(k, updater, fallback) {
  const current = readStorage(k, fallback)
  const next = updater(current)
  writeStorage(k, next)
  return next
}

export function subscribeStorage(callback) {
  const onStorage = (e) => {
    if (e?.key?.startsWith(PREFIX)) callback()
  }
  const onCustom = () => callback()

  window.addEventListener('storage', onStorage)
  window.addEventListener('intellinotes-storage', onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('intellinotes-storage', onCustom)
  }
}

export const StorageKeys = {
  session: 'session',
  students: 'students',
  teachers: 'teachers',
  submittedCourses: 'submittedCourses',
  enrollments: 'enrollments',
  teacherContact: 'teacherContact',
  financeSettings: 'financeSettings',
  cart: 'cart',
  purchases: 'purchases',
  progress: 'progress',
  admin: 'admin',
}

export function resetAllDemoData() {
  Object.values(StorageKeys).forEach((k) => window.localStorage.removeItem(key(k)))
  window.dispatchEvent(new CustomEvent('intellinotes-storage', { detail: { key: '*' } }))
}

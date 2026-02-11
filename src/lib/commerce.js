import { getCourseById, getPackById, getAllCourses } from './catalog.js'

export function itemKey(item) {
  return `${item.type}:${item.id}`
}

export function resolveCartItem(item) {
  if (item.type === 'course') {
    const course = getCourseById(item.id)
    if (!course) return null
    return { type: 'course', id: course.id, title: course.title, priceDH: course.priceDH, meta: course }
  }
  if (item.type === 'pack') {
    const pack = getPackById(item.id)
    if (!pack) return null
    const courses = pack.courseIds.map(getCourseById).filter(Boolean)
    return { type: 'pack', id: pack.id, title: pack.title, priceDH: pack.priceDH, meta: { ...pack, courses } }
  }
  return null
}

export function computePackOriginalPrice(pack) {
  const courses = getAllCourses()
  return (pack.courseIds || [])
    .map((id) => courses.find((c) => c.id === id))
    .filter(Boolean)
    .reduce((sum, c) => sum + Number(c.priceDH || 0), 0)
}

export function cartTotals(cartItems) {
  const resolved = cartItems.map(resolveCartItem).filter(Boolean)
  const totalDH = resolved.reduce((sum, it) => sum + Number(it.priceDH || 0), 0)
  return { resolved, totalDH }
}


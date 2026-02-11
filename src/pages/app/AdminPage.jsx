import React, { useMemo, useState } from 'react'
import PageTitle from '../../components/PageTitle.jsx'
import Badge from '../../components/Badge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Tabs from '../../components/Tabs.jsx'
import MascotAside from '../../components/MascotAside.jsx'
import { StorageKeys, resetAllDemoData, updateStorage } from '../../lib/storage.js'
import { useStorageValue } from '../../lib/useStorageValue.js'
import { logout } from '../../lib/session.js'
import { getAllCourses } from '../../lib/catalog.js'
import MiniBarChart from '../../components/MiniBarChart.jsx'
import { formatDH, formatDateTime, formatPercent } from '../../lib/currency.js'

function statusColor(status) {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'orange'
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCsv(rows) {
  const escape = (v) => {
    const s = String(v ?? '')
    if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replaceAll('"', '""')}"`
    return s
  }
  return rows.map((r) => r.map(escape).join(',')).join('\n')
}

export default function AdminPage() {
  const submitted = useStorageValue(StorageKeys.submittedCourses, [])
  const students = useStorageValue(StorageKeys.students, [])
  const teachers = useStorageValue(StorageKeys.teachers, [])
  const purchases = useStorageValue(StorageKeys.purchases, [])
  const teacherContact = useStorageValue(StorageKeys.teacherContact, {})
  const financeSettings = useStorageValue(StorageKeys.financeSettings, { commissionRate: 0.2 })
  const [tab, setTab] = useState('stats') // stats | students | teachers | lessons | messages | sales | finance

  const { pendingLessons, otherLessons } = useMemo(() => {
    const p = (submitted || []).filter((c) => c.status === 'pending')
    const o = (submitted || []).filter((c) => c.status !== 'pending')
    return { pendingLessons: p, otherLessons: o }
  }, [submitted])

  const { pendingTeachers, approvedTeachers, rejectedTeachers } = useMemo(() => {
    const list = teachers || []
    return {
      pendingTeachers: list.filter((t) => t.verificationStatus === 'pending'),
      approvedTeachers: list.filter((t) => t.verificationStatus === 'approved'),
      rejectedTeachers: list.filter((t) => t.verificationStatus === 'rejected'),
    }
  }, [teachers])

  const stats = useMemo(() => {
    const s = students || []
    const t = teachers || []
    const lessonsAvailable = getAllCourses().length
    const lessonsSubmitted = (submitted || []).length
    const lessonsPending = (submitted || []).filter((c) => c.status === 'pending').length
    const lessonsApproved = (submitted || []).filter((c) => c.status === 'approved').length
    const studentsCount = s.filter((x) => x.studentRole === 'étudiant').length
    const traineesCount = s.filter((x) => x.studentRole === 'stagiaire').length
    const orders = purchases || []
    const revenue = orders.reduce((sum, p) => sum + Number(p.totalDH || 0), 0)
    return {
      studentsTotal: s.length,
      studentsCount,
      traineesCount,
      teachersTotal: t.length,
      teachersPending: t.filter((x) => x.verificationStatus === 'pending' || x.verificationStatus === 'required').length,
      teachersApproved: t.filter((x) => x.verificationStatus === 'approved').length,
      lessonsAvailable,
      lessonsSubmitted,
      lessonsPending,
      lessonsApproved,
      ordersCount: orders.length,
      revenueDH: revenue,
    }
  }, [students, teachers, submitted, purchases])

  const messages = useMemo(() => {
    const map = teacherContact || {}
    const all = []
    for (const [teacherId, list] of Object.entries(map)) {
      for (const m of list || []) all.push({ ...m, teacherId })
    }
    const teacherById = new Map((teachers || []).map((t) => [t.id, t]))
    return all
      .map((m) => ({
        ...m,
        teacherName: teacherById.get(m.teacherId)?.name || 'Formateur',
        teacherEmail: teacherById.get(m.teacherId)?.email || '—',
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }, [teacherContact, teachers])

  const sales = useMemo(() => {
    const courseById = new Map(getAllCourses().map((c) => [c.id, c]))
    const studentById = new Map((students || []).map((s) => [s.id, s]))
    const rows = (purchases || []).slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return rows.map((p) => {
      const buyer = studentById.get(p.userId)
      const items = (p.items || []).filter((it) => it.type === 'course').map((it) => courseById.get(it.id)).filter(Boolean)
      return {
        ...p,
        buyerName: buyer?.name || '—',
        buyerEmail: buyer?.email || '—',
        items,
      }
    })
  }, [purchases, students])

  const finance = useMemo(() => {
    const rate = Number(financeSettings?.commissionRate ?? 0.2)
    const courseById = new Map(getAllCourses().map((c) => [c.id, c]))
    const lines = new Map()

    for (const p of purchases || []) {
      for (const it of p.items || []) {
        if (it.type !== 'course') continue
        const c = courseById.get(it.id)
        if (!c) continue
        const key = c.id
        const price = Number(c.priceDH || 0)
        const prev = lines.get(key) || { course: c, soldCount: 0, grossDH: 0 }
        lines.set(key, { ...prev, soldCount: prev.soldCount + 1, grossDH: prev.grossDH + price })
      }
    }

    const perCourse = Array.from(lines.values())
      .map((x) => ({
        ...x,
        platformDH: Math.round(x.grossDH * rate),
        teacherDH: Math.round(x.grossDH * (1 - rate)),
        rate,
      }))
      .sort((a, b) => b.grossDH - a.grossDH)

    const totalGrossDH = perCourse.reduce((s, x) => s + x.grossDH, 0)
    const totalPlatformDH = perCourse.reduce((s, x) => s + x.platformDH, 0)
    const totalTeacherDH = perCourse.reduce((s, x) => s + x.teacherDH, 0)
    return { rate, perCourse, totalGrossDH, totalPlatformDH, totalTeacherDH }
  }, [purchases, financeSettings])

  const last7 = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('fr-MA', { weekday: 'short' })
      days.push({ key, label })
    }
    const revenueByDay = new Map(days.map((d) => [d.key, 0]))
    const ordersByDay = new Map(days.map((d) => [d.key, 0]))
    for (const p of purchases || []) {
      const key = new Date(p.createdAt || 0).toISOString().slice(0, 10)
      if (!revenueByDay.has(key)) continue
      revenueByDay.set(key, revenueByDay.get(key) + Number(p.totalDH || 0))
      ordersByDay.set(key, ordersByDay.get(key) + 1)
    }
    return {
      revenue: days.map((d) => ({ label: d.label, value: revenueByDay.get(d.key) || 0 })),
      orders: days.map((d) => ({ label: d.label, value: ordersByDay.get(d.key) || 0 })),
    }
  }, [purchases])

  function setStatus(id, status) {
    updateStorage(
      StorageKeys.submittedCourses,
      (items) => (items || []).map((c) => (c.id === id ? { ...c, status, moderatedAt: Date.now(), moderatedBy: 'admin' } : c)),
      [],
    )
  }

  function setTeacherVerification(teacherId, verificationStatus) {
    updateStorage(
      StorageKeys.teachers,
      (items) =>
        (items || []).map((t) =>
          t.id === teacherId ? { ...t, verificationStatus, verificationModeratedAt: Date.now(), verificationModeratedBy: 'admin' } : t,
        ),
      [],
    )
  }

  function markMessageHandled(teacherId, messageId, handled) {
    updateStorage(
      StorageKeys.teacherContact,
      (all) => {
        const next = { ...(all || {}) }
        const list = Array.isArray(next[teacherId]) ? next[teacherId] : []
        next[teacherId] = list.map((m) =>
          m.id === messageId ? { ...m, handledAt: handled ? Date.now() : null, status: handled ? 'handled' : 'sent' } : m,
        )
        return next
      },
      {},
    )
  }

  function setCommissionRate(next) {
    const v = Number(next)
    const rate = Number.isFinite(v) ? Math.max(0, Math.min(0.9, v)) : 0.2
    updateStorage(StorageKeys.financeSettings, () => ({ commissionRate: rate }), { commissionRate: 0.2 })
  }

  function onReset() {
    resetAllDemoData()
    logout()
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      <PageTitle
        title="Admin"
        subtitle="Statistiques + inscriptions + modération (formateurs & cours)."
        right={
          <button className="btn danger" onClick={onReset} title="Efface le localStorage IntelliNotes">
            Réinitialiser démo
          </button>
        }
      />

      <MascotAside mascotSrc="/assets/mascot_learning_helper.png" mascotAlt="" mascotWidth={130} align="center">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'stats', label: 'Statistiques' },
            { value: 'students', label: `Apprenants (${stats.studentsTotal})` },
            { value: 'teachers', label: `Formateurs (${stats.teachersTotal})` },
            { value: 'lessons', label: `Leçons (${stats.lessonsSubmitted})` },
            { value: 'messages', label: `Messages (${messages.length})` },
            { value: 'sales', label: `Achats (${stats.ordersCount})` },
            { value: 'finance', label: 'Finance' },
          ]}
        />
      </MascotAside>

      {tab === 'stats' ? (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <MascotAside mascotSrc="/assets/mascot_future_vision.png" mascotAlt="" mascotWidth={170} align="center">
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Résumé</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <Badge color="blue">Étudiants: {stats.studentsCount}</Badge>
                  <Badge color="blue">Stagiaires: {stats.traineesCount}</Badge>
                  <Badge color="orange">Formateurs (pending): {stats.teachersPending}</Badge>
                  <Badge color="green">Formateurs (approved): {stats.teachersApproved}</Badge>
                  <Badge color="gray">Leçons dispo: {stats.lessonsAvailable}</Badge>
                  <Badge color="orange">Leçons pending: {stats.lessonsPending}</Badge>
                  <Badge color="green">Leçons approved: {stats.lessonsApproved}</Badge>
                  <Badge color="gray">Achats: {stats.ordersCount}</Badge>
                  <Badge color="green">Chiffre: {formatDH(stats.revenueDH)}</Badge>
                </div>
                <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                  Note: “Leçons dispo” = base + cours formateurs approuvés.
                </div>
              </div>
            </MascotAside>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            <MiniBarChart title="Revenu (DH)" data={last7.revenue} formatValue={(v) => formatDH(v)} />
            <MiniBarChart title="Nombre d’achats" data={last7.orders} />
          </div>
        </div>
      ) : null}

      {tab === 'students' ? (
        students.length ? (
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Inscriptions apprenants</div>
            <div className="grid" style={{ gap: 10, marginTop: 12 }}>
              {students
                .slice()
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                .map((s) => (
                  <div key={s.id} className="surface" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 900 }}>{s.name}</div>
                      <Badge color="gray">{s.studentRole}</Badge>
                    </div>
                    <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                      {s.email} • {s.qcm ? 'QCM: OK' : 'QCM: non'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Aucun apprenant" description="Aucune inscription apprenant enregistrée." mascotSrc="/assets/mascot.png" />
        )
      ) : null}

      {tab === 'teachers' ? (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Vérification formateurs</div>
              <Badge color="orange">Pending: {pendingTeachers.length}</Badge>
            </div>

            {pendingTeachers.length ? (
              <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                {pendingTeachers.map((t) => (
                  <div key={t.id} className="surface" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ fontWeight: 900 }}>{t.name}</div>
                      <Badge color="orange">PENDING</Badge>
                    </div>
                    <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                      {t.email} • Spécialité: {t.specialty}
                      <br />
                      <strong>Doc:</strong> {t.verificationDoc?.name || '—'} ({t.verificationDoc?.type || '—'})
                      <br />
                      Envoyé: {t.verificationSubmittedAt ? new Date(t.verificationSubmittedAt).toLocaleString() : '—'} • Échéance: {t.verificationReviewDueAt ? new Date(t.verificationReviewDueAt).toLocaleString() : '—'}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                      <button className="btn success" onClick={() => setTeacherVerification(t.id, 'approved')}>
                        Accepter
                      </button>
                      <button className="btn danger" onClick={() => setTeacherVerification(t.id, 'rejected')}>
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted" style={{ marginTop: 12 }}>
                Aucun formateur en attente.
              </div>
            )}
          </div>

          {(approvedTeachers.length || rejectedTeachers.length) ? (
            <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Liste formateurs</div>
              <div className="grid" style={{ gap: 10, marginTop: 12 }}>
                {[...approvedTeachers, ...rejectedTeachers]
                  .slice()
                  .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                  .map((t) => (
                    <div key={t.id} className="surface" style={{ padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 900 }}>{t.name}</div>
                        <Badge color={t.verificationStatus === 'approved' ? 'green' : 'red'}>{String(t.verificationStatus).toUpperCase()}</Badge>
                      </div>
                      <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                        {t.email} • {t.specialty}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'lessons' ? (
        <div className="grid" style={{ gap: 14 }}>
          {pendingLessons.length === 0 ? (
            <EmptyState
              title="Aucune leçon en attente"
              description="Quand un formateur dépose un cours, il apparaît ici (pending)."
              mascotSrc="/assets/mascot_guide_section.png"
            />
          ) : (
            <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Leçons en attente</div>
                <Badge color="orange">{pendingLessons.length} pending</Badge>
              </div>
              <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                {pendingLessons.map((c) => (
                  <div key={c.id} className="surface" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ fontWeight: 900 }}>{c.title}</div>
                      <Badge color={statusColor(c.status)}>{String(c.status).toUpperCase()}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      <Badge color="blue">{c.category}</Badge>
                      <Badge color="gray">{c.level}</Badge>
                      <Badge color="green">{c.priceDH} DH</Badge>
                      <Badge color="orange">{c.teacherName}</Badge>
                      {(c.tags || []).slice(0, 4).map((t) => (
                        <Badge key={t} color="gray">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                      <strong>Fichier:</strong> {c.file?.name || '—'} ({c.file?.type || '—'})
                      <br />
                      <strong>Email:</strong> {c.teacherEmail}
                      <br />
                      <strong>Description:</strong> {c.description}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                      <button className="btn success" onClick={() => setStatus(c.id, 'approved')}>
                        Approuver
                      </button>
                      <button className="btn danger" onClick={() => setStatus(c.id, 'rejected')}>
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherLessons.length ? (
            <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Historique leçons</div>
              <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                {otherLessons.map((c) => (
                  <div key={c.id} className="surface" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 900 }}>{c.title}</div>
                      <Badge color={statusColor(c.status)}>{String(c.status).toUpperCase()}</Badge>
                    </div>
                    <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                      {c.teacherName} • {c.category} • {c.level} • {c.priceDH} DH
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'messages' ? (
        messages.length ? (
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Messages reçus</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Inbox démo (contact formateur).
              </div>
            </div>
            <div className="grid" style={{ gap: 12, marginTop: 12 }}>
              {messages.map((m) => (
                <div key={m.id} className="surface" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900 }}>{m.subject}</div>
                    <Badge color={m.status === 'handled' ? 'green' : 'orange'}>{m.status === 'handled' ? 'TRAITÉ' : 'NOUVEAU'}</Badge>
                  </div>
                  <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    <strong>{m.teacherName}</strong> • {m.teacherEmail} • {formatDateTime(m.createdAt)}
                    {m.handledAt ? ` • Traité: ${formatDateTime(m.handledAt)}` : ''}
                  </div>
                  <div className="muted" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                    {m.message}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                    {m.status === 'handled' ? (
                      <button className="btn ghost" onClick={() => markMessageHandled(m.teacherId, m.id, false)}>
                        Marquer non traité
                      </button>
                    ) : (
                      <button className="btn success" onClick={() => markMessageHandled(m.teacherId, m.id, true)}>
                        Marquer traité
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Aucun message" description="Les messages formateurs apparaîtront ici." mascotSrc="/assets/mascot_ai_assistant.png" />
        )
      ) : null}

      {tab === 'sales' ? (
        sales.length ? (
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Achats (transactions)</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  onClick={() => {
                    const rows = [
                      ['purchaseId', 'date', 'buyerName', 'buyerEmail', 'itemsCount', 'totalDH'],
                      ...sales.map((p) => [p.id, formatDateTime(p.createdAt), p.buyerName, p.buyerEmail, (p.items || []).length, p.totalDH]),
                    ]
                    downloadText('achats.csv', toCsv(rows))
                  }}
                >
                  Exporter CSV
                </button>
              </div>
            </div>

            <div className="grid" style={{ gap: 12, marginTop: 12 }}>
              {sales.map((p) => (
                <div key={p.id} className="surface" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontWeight: 900 }}>
                      {p.buyerName} <span className="muted" style={{ fontWeight: 650 }}>({p.buyerEmail})</span>
                    </div>
                    <Badge color="green">{formatDH(p.totalDH)}</Badge>
                  </div>
                  <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                    {formatDateTime(p.createdAt)} • {p.id}
                  </div>
                  <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                    <strong>Leçons achetées:</strong>
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, display: 'grid', gap: 6 }}>
                      {(p.items || []).map((c) => (
                        <li key={c.id}>
                          {c.title} — {formatDH(c.priceDH)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Aucun achat" description="Après checkout (apprenant), les transactions apparaîtront ici." mascotSrc="/assets/mascot.png" />
        )
      ) : null}

      {tab === 'finance' ? (
        <div className="grid" style={{ gap: 14 }}>
          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Commission plateforme</div>
              <Badge color="gray">Actuel: {formatPercent(finance.rate)}</Badge>
            </div>
            <div className="muted" style={{ marginTop: 10 }}>
              La plateforme prend un pourcentage sur chaque leçon vendue (démo).
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Taux (0–0.9):
              </label>
              <input
                className="input"
                style={{ maxWidth: 140 }}
                type="number"
                min={0}
                max={0.9}
                step={0.05}
                value={finance.rate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <button
                className="btn"
                onClick={() => downloadText('finance.json', JSON.stringify(finance, null, 2))}
              >
                Exporter JSON (format)
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 16, boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Synthèse</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Badge color="gray">Brut: {formatDH(finance.totalGrossDH)}</Badge>
                <Badge color="green">Plateforme: {formatDH(finance.totalPlatformDH)}</Badge>
                <Badge color="blue">Formateurs: {formatDH(finance.totalTeacherDH)}</Badge>
              </div>
            </div>
            <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              Par leçon (nombre vendu, revenu brut, part plateforme, part formateur).
            </div>
            {finance.perCourse.length ? (
              <div className="grid" style={{ gap: 10, marginTop: 12 }}>
                {finance.perCourse.map((x) => (
                  <div key={x.course.id} className="surface" style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 900 }}>{x.course.title}</div>
                      <Badge color="gray">Vendu: {x.soldCount}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      <Badge color="gray">Brut: {formatDH(x.grossDH)}</Badge>
                      <Badge color="green">Plateforme ({formatPercent(x.rate)}): {formatDH(x.platformDH)}</Badge>
                      <Badge color="blue">Formateur: {formatDH(x.teacherDH)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="muted" style={{ marginTop: 12 }}>
                Aucun calcul finance: pas encore d’achats.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Grade } from '@/types'
import clsx from 'clsx'

const gradeColor = (v: string) => {
  const n = parseInt(v)
  if (n === 5) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  if (n === 4) return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  if (n === 3) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  if (n <= 2) return 'bg-red-500/20 text-red-300 border-red-500/30'
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
}

export default function GradesPage() {
  const { data: session } = useSession()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  useEffect(() => {
    if (!session?.accessToken) return
    const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
    const endDate = format(new Date(), 'yyyy-MM-dd')

    fetch(`/api/grades?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setGrades(data)
      })
      .catch(() => setError('Не удалось загрузить оценки'))
      .finally(() => setLoading(false))
  }, [session])

  const bySubject = grades.reduce<Record<string, Grade[]>>((acc, g) => {
    const name = g.subject.name
    if (!acc[name]) acc[name] = []
    acc[name].push(g)
    return acc
  }, {})

  const subjects = Object.keys(bySubject).sort()

  const avg = (subjectGrades: Grade[]) => {
    const nums = subjectGrades.map((g) => parseInt(g.value)).filter((n) => !isNaN(n))
    if (!nums.length) return null
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
  }

  const filtered = selectedSubject === 'all' ? grades : (bySubject[selectedSubject] ?? [])
  const sortedFiltered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Оценки</h1>
        <p className="text-slate-400 text-sm mt-1">Последние 3 месяца</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-surface-card rounded-xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 text-center">{error}</div>
      ) : (
        <div className="flex gap-6">
          <div className="w-56 shrink-0 space-y-1">
            <button
              onClick={() => setSelectedSubject('all')}
              className={clsx('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors', selectedSubject === 'all' ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-surface-border')}
            >
              Все предметы <span className="ml-2 text-xs opacity-60">({grades.length})</span>
            </button>
            {subjects.map((s) => (
              <button key={s} onClick={() => setSelectedSubject(s)} className={clsx('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex justify-between items-center', selectedSubject === s ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-surface-border')}>
                <span className="truncate">{s}</span>
                <span className="text-xs font-bold ml-2 shrink-0">{avg(bySubject[s])}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-2">
            {sortedFiltered.length === 0 ? (
              <div className="text-center text-slate-500 py-12">Нет оценок</div>
            ) : (
              sortedFiltered.map((grade) => (
                <div key={grade.id} className="bg-surface-card border border-surface-border rounded-xl px-4 py-3 flex items-center gap-4 animate-fade-in">
                  <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-lg shrink-0', gradeColor(grade.value))}>
                    {grade.value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{grade.subject.name}</div>
                    {grade.comment && <div className="text-xs text-slate-500 truncate">{grade.comment}</div>}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">{format(new Date(grade.date), 'd MMM', { locale: ru })}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

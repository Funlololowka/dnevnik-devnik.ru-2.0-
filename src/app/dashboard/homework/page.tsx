'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Homework } from '@/types'
import clsx from 'clsx'

export default function HomeworkPage() {
  const { data: session } = useSession()
  const [homework, setHomework] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!session?.accessToken) return
    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 14), 'yyyy-MM-dd')

    fetch(`/api/homework?startDate=${startDate}&endDate=${endDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setHomework(data)
      })
      .catch(() => setError('Не удалось загрузить домашние задания'))
      .finally(() => setLoading(false))
  }, [session])

  const toggleDone = (id: number) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const byDate = homework.reduce<Record<string, Homework[]>>((acc, h) => {
    if (!acc[h.dueDate]) acc[h.dueDate] = []
    acc[h.dueDate].push(h)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Домашние задания</h1>
          <p className="text-slate-400 text-sm mt-1">Ближайшие 2 недели</p>
        </div>
        {homework.length > 0 && (
          <div className="text-sm text-slate-400">
            <span className="text-emerald-400 font-semibold">{done.size}</span> / {homework.length} выполнено
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-surface-card rounded animate-pulse" />
              <div className="h-16 bg-surface-card rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 text-center">{error}</div>
      ) : homework.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🎉</div>
          <div>Домашних заданий нет!</div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div key={dateStr}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {format(new Date(dateStr), 'EEEE, d MMMM', { locale: ru })}
              </div>
              <div className="space-y-2">
                {byDate[dateStr].map((hw) => (
                  <div key={hw.id} className={clsx('bg-surface-card border rounded-xl p-4 flex items-start gap-4 transition-all duration-200', done.has(hw.id) ? 'border-emerald-500/30 opacity-60' : 'border-surface-border hover:border-brand-500/30')}>
                    <button onClick={() => toggleDone(hw.id)} className={clsx('mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all', done.has(hw.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-brand-400')}>
                      {done.has(hw.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-brand-300 mb-1">{hw.lesson.subject.name}</div>
                      <div className={clsx('text-sm text-slate-300', done.has(hw.id) && 'line-through text-slate-500')}>{hw.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

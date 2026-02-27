'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Lesson } from '@/types'
import clsx from 'clsx'

const subjectColors: Record<string, string> = {}
const palette = [
  'bg-violet-500/20 border-violet-500/40 text-violet-300',
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  'bg-amber-500/20 border-amber-500/40 text-amber-300',
  'bg-rose-500/20 border-rose-500/40 text-rose-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
]
let colorIndex = 0
function getSubjectColor(name: string) {
  if (!subjectColors[name]) {
    subjectColors[name] = palette[colorIndex % palette.length]
    colorIndex++
  }
  return subjectColors[name]
}

const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export default function SchedulePage() {
  const { data: session } = useSession()
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).slice(0, 6)

  useEffect(() => {
    if (!session?.accessToken) return
    setLoading(true)
    setError(null)

    fetch(`/api/schedule?startDate=${format(weekStart, 'yyyy-MM-dd')}&endDate=${format(weekEnd, 'yyyy-MM-dd')}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setLessons(data)
      })
      .catch(() => setError('Не удалось загрузить расписание'))
      .finally(() => setLoading(false))
  }, [weekStart, session])

  const getLessonsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return lessons.filter((l) => l.date === dateStr).sort((a, b) => a.number - b.number)
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Расписание</h1>
          <p className="text-slate-400 text-sm mt-1">
            {format(weekStart, 'd MMM', { locale: ru })} - {format(weekEnd, 'd MMM yyyy', { locale: ru })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((d) => subWeeks(d, 1))} className="p-2 hover:bg-surface-border rounded-lg transition-colors text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-3 py-1.5 text-xs text-brand-400 border border-brand-500/30 hover:bg-brand-600/10 rounded-lg transition-colors">
            Сегодня
          </button>
          <button onClick={() => setWeekStart((d) => addWeeks(d, 1))} className="p-2 hover:bg-surface-border rounded-lg transition-colors text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-3">
          {days.map((day) => (
            <div key={day.toISOString()} className="space-y-2">
              <div className="h-8 bg-surface-card rounded-lg animate-pulse" />
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-surface-card rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {days.map((day, i) => {
            const dayLessons = getLessonsForDay(day)
            const today = isToday(day)
            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className={clsx('text-center py-2 rounded-lg text-xs font-semibold', today ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' : 'text-slate-500')}>
                  <div>{DAYS_RU[i]}</div>
                  <div className={clsx('text-lg font-bold', today ? 'text-brand-200' : 'text-slate-300')}>{format(day, 'd')}</div>
                </div>
                {dayLessons.length === 0 ? (
                  <div className="h-16 flex items-center justify-center"><span className="text-xs text-slate-600">-</span></div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div key={lesson.id} className={clsx('p-2.5 rounded-xl border text-xs space-y-1 animate-slide-up', getSubjectColor(lesson.subject.name))}>
                      <div className="font-semibold leading-tight">{lesson.subject.name}</div>
                      <div className="opacity-70">{lesson.startTime} - {lesson.endTime}</div>
                      {lesson.room && <div className="opacity-60">каб. {lesson.room}</div>}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

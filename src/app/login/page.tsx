'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Вставь токен!')
      return
    }
    setLoading(true)
    setError('')

    const result = await signIn('dnevnik-token', {
      token: token.trim(),
      redirect: false,
    })

    if (result?.error) {
      setError('Токен не подошёл - проверь что скопировал правильно')
      setLoading(false)
    } else {
      window.location.href = '/dashboard/schedule'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-10 shadow-2xl animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600/20 border border-brand-500/30 rounded-2xl mb-5">
              <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Дневник+</h1>
            <p className="text-slate-400 text-sm">Нормальный интерфейс для Дневник.ру</p>
          </div>

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-slate-300">Access Token</label>
            <textarea
              value={token}
              onChange={(e) => { setToken(e.target.value); setError('') }}
              placeholder="Вставь сюда токен из браузера..."
              rows={3}
              className="w-full bg-surface border border-surface-border focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors resize-none font-mono"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group mb-6"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Проверяем токен...
              </>
            ) : (
              <>
                Войти
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          <div className="border border-surface-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowInstructions((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-surface-border transition-colors"
            >
              <span className="flex items-center gap-2"><span>🔑</span> Где взять токен?</span>
              <svg className={`w-4 h-4 transition-transform ${showInstructions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showInstructions && (
              <div className="px-4 pb-4 space-y-3 text-sm text-slate-400 border-t border-surface-border pt-4">
                <ol className="space-y-2.5">
                  {[
                    'Открой dnevnik.ru и войди через Госуслуги',
                    'Нажми F12 чтобы открыть DevTools',
                    'Перейди на вкладку Application (или «Приложение»)',
                    'Слева открой Local Storage → https://dnevnik.ru',
                    'Найди ключ access_token и скопируй значение',
                    'Вставь сюда 👆',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 w-5 h-5 bg-brand-600/20 text-brand-400 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-slate-600 pt-1">Если токена нет в localStorage - ищи в Network → заголовок Authorization запросов к api.dnevnik.ru</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Save, Wind } from 'lucide-react'
import { PUFFS_PER_CIGARETTE } from '../data/cigaretteBrands'
import { PuffPeriodTracker } from './PuffPeriodTracker'
import {
  formatDate,
  getLastNDates,
  saveProfileName,
  savePuffLogs,
  setLogForDate,
  type DiaryPeriod,
  type PuffLogs,
} from '../utils/puffDiary'
import { ResultBox } from './ResultBox'

interface PuffCalculatorProps {
  puffs: number
  onPuffsChange: (v: number) => void
  logs: PuffLogs
  setLogs: (logs: PuffLogs) => void
  profileName: string
  period: DiaryPeriod
  setPeriod: (period: DiaryPeriod) => void
}

export function PuffCalculator({
  puffs,
  onPuffsChange,
  logs,
  setLogs,
  profileName,
  period,
  setPeriod,
}: PuffCalculatorProps) {
  const today = formatDate(new Date())
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [savedHint, setSavedHint] = useState('')
  const restoredToday = useRef(false)

  const periodDates = useMemo(() => getLastNDates(period), [period])

  useEffect(() => {
    if (restoredToday.current) return
    restoredToday.current = true
    const savedToday = logs[today]
    if (savedToday) {
      onPuffsChange(savedToday)
    }
  }, [logs, today, onPuffsChange])

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const date of periodDates) {
      const value = logs[date]
      next[date] = typeof value === 'number' ? String(value) : ''
    }
    setDraft(next)
  }, [periodDates, logs])

  const cigarettes = Math.round(puffs / PUFFS_PER_CIGARETTE)
  const formula = `${puffs} puffs ÷ ${PUFFS_PER_CIGARETTE} = ${cigarettes} cigarettes`

  const hasLoggedToday = typeof logs[today] === 'number'

  function flashSaved(message: string) {
    setSavedHint(message)
    setTimeout(() => setSavedHint(''), 2500)
  }

  function handleLogToday() {
    const next = setLogForDate(logs, today, puffs)
    setLogs(next)
    setDraft((prev) => ({ ...prev, [today]: String(puffs) }))
    flashSaved('Today saved on this device')
  }

  function handleDraftChange(date: string, value: string) {
    setDraft((prev) => ({ ...prev, [date]: value }))
  }

  function handleSaveLog() {
    let next = { ...logs }
    for (const date of periodDates) {
      const raw = draft[date]?.trim()
      if (!raw) {
        delete next[date]
        continue
      }
      const value = Math.max(0, Math.min(800, Number(raw)))
      if (Number.isNaN(value)) continue
      next[date] = value
    }
    saveProfileName(profileName)
    savePuffLogs(next)
    setLogs(next)
    flashSaved('Log saved on this device')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Wind className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Puffs to Cigarette Comparison
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Daily Puffs Count
              </label>
              <p className="mb-3 text-3xl font-bold text-brand-600">{puffs}</p>
              <input
                type="range"
                min={10}
                max={800}
                step={10}
                value={puffs}
                onChange={(e) => onPuffsChange(Number(e.target.value))}
              />
              <p className="mt-2 text-xs text-slate-500">
                Research shows: 10–15 puffs ≈ 1 cigarette
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-700">
                Daily Puff Reference Guide
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>Light use: 50–100 puffs/day (~4–8 cigarettes)</li>
                <li>Moderate use: 150–250 puffs/day (~12–20 cigarettes)</li>
                <li>Heavy use: 300+ puffs/day (~25+ cigarettes)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <ResultBox cigarettes={cigarettes} formula={formula} />
            <button
              type="button"
              onClick={handleLogToday}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto"
            >
              <Save className="h-4 w-4" />
              Log today&apos;s puffs
            </button>
            {savedHint && !hasLoggedToday && (
              <p className="text-sm font-medium text-brand-600">{savedHint}</p>
            )}
          </div>
        </div>
      </div>

      {hasLoggedToday && (
        <PuffPeriodTracker
          logs={logs}
          period={period}
          onPeriodChange={setPeriod}
          title="Your progress"
          subtitle="Enter puffs in the table — cigarettes update automatically"
          editable
          collapsible
          draft={draft}
          onDraftChange={handleDraftChange}
          onSave={handleSaveLog}
          saveHint={savedHint}
        />
      )}
    </div>
  )
}

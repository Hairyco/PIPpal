import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, Save } from 'lucide-react'
import { PUFFS_PER_CIGARETTE } from '../data/cigaretteBrands'
import {
  DIARY_PERIODS,
  PERIOD_LABELS,
  formatDate,
  summarizePeriodLogs,
  type DiaryPeriod,
  type PuffLogs,
} from '../utils/puffDiary'

interface PuffPeriodTrackerProps {
  logs: PuffLogs
  period: DiaryPeriod
  onPeriodChange?: (period: DiaryPeriod) => void
  title?: string
  subtitle?: string
  compact?: boolean
  editable?: boolean
  draft?: Record<string, string>
  onDraftChange?: (date: string, value: string) => void
  onSave?: () => void
  saveHint?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function PuffPeriodTracker({
  logs,
  period,
  onPeriodChange,
  title = 'Puff tracking',
  subtitle,
  compact = false,
  editable = false,
  draft = {},
  onDraftChange,
  onSave,
  saveHint,
  collapsible = false,
  defaultOpen = false,
}: PuffPeriodTrackerProps) {
  const [open, setOpen] = useState(defaultOpen)
  const summary = useMemo(() => summarizePeriodLogs(logs, period), [logs, period])
  const today = formatDate(new Date())

  const displaySummary = useMemo(() => {
    if (!editable) return summary

    const days = summary.days.map((day) => {
      const raw = draft[day.date]?.trim()
      if (!raw) {
        return { ...day, puffs: null, cigarettes: null }
      }
      const puffs = Number(raw)
      if (Number.isNaN(puffs)) {
        return { ...day, puffs: null, cigarettes: null }
      }
      return {
        ...day,
        puffs,
        cigarettes: Math.round(puffs / PUFFS_PER_CIGARETTE),
      }
    })

    const logged = days.filter((d) => d.puffs !== null)
    const loggedValues = logged.map((d) => d.puffs as number)
    const progressDelta =
      loggedValues.length >= 2
        ? loggedValues[loggedValues.length - 1] - loggedValues[0]
        : null

    return {
      days,
      loggedCount: logged.length,
      totalPuffs: logged.reduce((sum, d) => sum + (d.puffs as number), 0),
      totalCigarettes: logged.reduce((sum, d) => sum + (d.cigarettes as number), 0),
      progressDelta,
    }
  }, [draft, editable, summary, period])

  const summaryLine =
    subtitle ??
    `${displaySummary.loggedCount} of ${period} days logged · track weekly, fortnightly or monthly`

  const header = (
    <div className="flex flex-1 items-start gap-2">
      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">
          {summaryLine}
          {displaySummary.progressDelta !== null && displaySummary.progressDelta !== 0 && (
            <span className={displaySummary.progressDelta < 0 ? ' text-brand-600' : ' text-accent-500'}>
              {' '}
              · {displaySummary.progressDelta < 0 ? 'Down' : 'Up'}{' '}
              {Math.abs(displaySummary.progressDelta)} puffs since start of period
            </span>
          )}
        </p>
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 p-6 text-left"
          aria-expanded={open}
        >
          {header}
          <ChevronDown
            className={`mt-0.5 h-5 w-5 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <div className="p-6 pb-0">{header}</div>
      )}

      {(!collapsible || open) && (
        <div className={collapsible ? 'border-t border-slate-100 px-6 pb-6 pt-4' : 'px-6 pb-6'}>
          <div className="mb-4 flex flex-wrap gap-2 sm:justify-end">
            {DIARY_PERIODS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onPeriodChange?.(days)}
                disabled={!onPeriodChange}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  period === days
                    ? 'bg-brand-600 text-white'
                    : onPeriodChange
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'cursor-default bg-slate-100 text-slate-400'
                }`}
              >
                {PERIOD_LABELS[days]}
              </button>
            ))}
          </div>

      {displaySummary.loggedCount > 0 && (
        <div className={`mb-4 grid gap-3 ${compact ? 'grid-cols-2' : 'sm:grid-cols-3'}`}>
          <StatCard label="Total puffs" value={String(displaySummary.totalPuffs)} />
          <StatCard label="Total cigarettes" value={String(displaySummary.totalCigarettes)} />
          {!compact && (
            <StatCard
              label="Daily average"
              value={
                displaySummary.loggedCount > 0
                  ? `${Math.round(displaySummary.totalPuffs / displaySummary.loggedCount)} puffs`
                  : '—'
              }
            />
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-4">
          <span>Day</span>
          <span className="text-right">Puffs</span>
          <span className="text-right">Cigarettes</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {displaySummary.days.map((day) => {
            const draftRaw = draft[day.date] ?? ''
            const draftPuffs = draftRaw.trim() === '' ? null : Number(draftRaw)
            const displayPuffs = editable
              ? draftPuffs !== null && !Number.isNaN(draftPuffs)
                ? draftPuffs
                : null
              : day.puffs
            const displayCigarettes =
              displayPuffs !== null && !Number.isNaN(displayPuffs)
                ? Math.round(displayPuffs / PUFFS_PER_CIGARETTE)
                : null
            const isEmpty = displayPuffs === null
            const isToday = day.date === today

            return (
              <li
                key={day.date}
                className={`grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 px-3 py-2 text-sm sm:px-4 ${
                  isToday ? 'bg-brand-50/60' : ''
                } ${isEmpty ? 'text-slate-400' : 'text-slate-800'}`}
              >
                <span className={`py-0.5 font-medium ${isToday ? 'text-brand-800' : ''}`}>
                  {day.label}
                </span>
                {editable ? (
                  <input
                    type="number"
                    min={0}
                    max={800}
                    step={10}
                    value={draftRaw}
                    onChange={(e) => onDraftChange?.(day.date, e.target.value)}
                    placeholder="—"
                    aria-label={`Puffs on ${day.label}`}
                    className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-sm tabular-nums text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                ) : (
                  <span className="py-0.5 text-right tabular-nums">
                    {displayPuffs !== null ? displayPuffs : '—'}
                  </span>
                )}
                <span className="py-0.5 text-right tabular-nums">
                  {displayCigarettes !== null ? displayCigarettes : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {editable && onSave && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Save className="h-4 w-4" />
            Save log
          </button>
          {saveHint && <p className="text-sm font-medium text-brand-600">{saveHint}</p>}
        </div>
      )}

      {!editable && displaySummary.loggedCount === 0 && (
        <p className="mt-3 text-center text-sm text-slate-500">
          No puffs logged in this period yet
        </p>
      )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  )
}

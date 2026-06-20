import { PUFFS_PER_CIGARETTE } from '../data/cigaretteBrands'

export type DiaryPeriod = 7 | 14 | 30

export const PERIOD_LABELS: Record<DiaryPeriod, string> = {
  7: 'Weekly',
  14: 'Fortnightly',
  30: 'Monthly',
}

export const DIARY_PERIODS: DiaryPeriod[] = [7, 14, 30]

export interface PuffLogs {
  [date: string]: number
}

export interface FriendProfile {
  name: string
  logs: PuffLogs
  importedAt: string
}

export interface SharePayload {
  n: string
  logs: PuffLogs
  v: 1
}

const LOGS_KEY = 'quit-vaping:puff-logs'
const NAME_KEY = 'quit-vaping:profile-name'
const PERIOD_KEY = 'quit-vaping:diary-period'
const FRIEND_KEY = 'quit-vaping:friend-profile'

export interface PeriodDayStat {
  date: string
  label: string
  puffs: number | null
  cigarettes: number | null
}

export interface PeriodSummary {
  days: PeriodDayStat[]
  loggedCount: number
  totalPuffs: number
  totalCigarettes: number
  progressDelta: number | null
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatShortLabel(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
}

export function loadPuffLogs(): PuffLogs {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PuffLogs
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function savePuffLogs(logs: PuffLogs): void {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function loadProfileName(): string {
  return localStorage.getItem(NAME_KEY) ?? 'You'
}

export function saveProfileName(name: string): void {
  localStorage.setItem(NAME_KEY, name.trim() || 'You')
}

export function loadDiaryPeriod(): DiaryPeriod {
  const raw = localStorage.getItem(PERIOD_KEY)
  if (raw === '14' || raw === '30') return Number(raw) as DiaryPeriod
  return 7
}

export function saveDiaryPeriod(period: DiaryPeriod): void {
  localStorage.setItem(PERIOD_KEY, String(period))
}

export function loadFriendProfile(): FriendProfile | null {
  try {
    const raw = localStorage.getItem(FRIEND_KEY)
    if (!raw) return null
    return JSON.parse(raw) as FriendProfile
  } catch {
    return null
  }
}

export function saveFriendProfile(friend: FriendProfile | null): void {
  if (!friend) {
    localStorage.removeItem(FRIEND_KEY)
    return
  }
  localStorage.setItem(FRIEND_KEY, JSON.stringify(friend))
}

export function setLogForDate(logs: PuffLogs, date: string, puffs: number): PuffLogs {
  const next = { ...logs }
  if (puffs <= 0) {
    delete next[date]
  } else {
    next[date] = puffs
  }
  savePuffLogs(next)
  return next
}

export function getLastNDates(days: DiaryPeriod): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    dates.push(formatDate(d))
  }
  return dates
}

export interface WeekDay {
  date: string
  dayLabel: string
  isToday: boolean
}

export function getWeekDays(weekOffset = 0): WeekDay[] {
  const today = new Date()
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7)

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayStr = formatDate(today)

  return labels.map((dayLabel, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = formatDate(date)
    return { date: dateStr, dayLabel, isToday: dateStr === todayStr }
  })
}

export function averagePuffs(logs: PuffLogs, dates: string[]): number | null {
  const values = dates.map((d) => logs[d]).filter((v): v is number => typeof v === 'number')
  if (values.length === 0) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function encodeShareCode(name: string, logs: PuffLogs): string {
  const payload: SharePayload = { n: name.trim() || 'Friend', logs, v: 1 }
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function decodeShareCode(code: string): SharePayload | null {
  try {
    const parsed = JSON.parse(
      decodeURIComponent(escape(atob(code.trim()))),
    ) as SharePayload
    if (parsed.v !== 1 || typeof parsed.logs !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function buildShareUrl(code: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('compare', code)
  url.hash = ''
  return url.toString()
}

export function readSharePayloadFromUrl(): SharePayload | null {
  const code = new URLSearchParams(window.location.search).get('compare')
  if (!code) return null
  return decodeShareCode(code)
}

export function summarizePeriodLogs(logs: PuffLogs, period: DiaryPeriod): PeriodSummary {
  const dates = getLastNDates(period)
  const days: PeriodDayStat[] = dates.map((date) => {
    const raw = logs[date]
    const hasLog = typeof raw === 'number'
    return {
      date,
      label: formatShortLabel(date),
      puffs: hasLog ? raw : null,
      cigarettes: hasLog ? Math.round(raw / PUFFS_PER_CIGARETTE) : null,
    }
  })

  const logged = days.filter((d): d is PeriodDayStat & { puffs: number; cigarettes: number } =>
    d.puffs !== null,
  )
  const loggedValues = logged.map((d) => d.puffs)
  const progressDelta =
    loggedValues.length >= 2
      ? loggedValues[loggedValues.length - 1] - loggedValues[0]
      : null

  return {
    days,
    loggedCount: logged.length,
    totalPuffs: logged.reduce((sum, d) => sum + d.puffs, 0),
    totalCigarettes: logged.reduce((sum, d) => sum + d.cigarettes, 0),
    progressDelta,
  }
}

export function getLatestPuffEntry(logs: PuffLogs): { date: string; puffs: number } | null {
  const today = formatDate(new Date())
  if (typeof logs[today] === 'number') {
    return { date: today, puffs: logs[today] }
  }

  const entries = Object.entries(logs)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .sort(([a], [b]) => a.localeCompare(b))

  if (entries.length === 0) return null

  const [date, puffs] = entries[entries.length - 1]
  return { date, puffs }
}

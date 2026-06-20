import { useState } from 'react'
import {
  loadDiaryPeriod,
  loadProfileName,
  loadPuffLogs,
  saveDiaryPeriod,
  saveProfileName,
  type DiaryPeriod,
  type PuffLogs,
} from '../utils/puffDiary'

export function usePuffDiary() {
  const [logs, setLogs] = useState<PuffLogs>(() => loadPuffLogs())
  const [profileName, setProfileName] = useState(() => loadProfileName())
  const [period, setPeriodState] = useState<DiaryPeriod>(() => loadDiaryPeriod())

  function setPeriod(period: DiaryPeriod) {
    setPeriodState(period)
    saveDiaryPeriod(period)
  }

  function updateProfileName(name: string) {
    const trimmed = name.trim() || 'You'
    setProfileName(trimmed)
    saveProfileName(trimmed)
  }

  return {
    logs,
    setLogs,
    profileName,
    updateProfileName,
    period,
    setPeriod,
  }
}

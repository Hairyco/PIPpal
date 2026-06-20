import { useState } from 'react'
import { Users } from 'lucide-react'
import { PuffPeriodTracker } from './PuffPeriodTracker'
import { type DiaryPeriod, type PuffLogs, type SharePayload } from '../utils/puffDiary'

interface SharedPuffComparisonProps {
  name: string
  logs: PuffLogs
}

export function SharedPuffComparison({ name, logs }: SharedPuffComparisonProps) {
  const [period, setPeriod] = useState<DiaryPeriod>(7)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
        <Users className="h-5 w-5 text-brand-600" />
        <p className="text-sm text-brand-900">
          <span className="font-semibold">{name}</span> shared their puff diary — switch between
          weekly, fortnightly or monthly views below.
        </p>
      </div>

      <PuffPeriodTracker
        logs={logs}
        period={period}
        onPeriodChange={setPeriod}
        title={`${name}'s puff diary`}
        subtitle={`Last ${period} days · puffs and cigarette equivalents`}
      />
    </div>
  )
}

export function SharedPuffComparisonFromPayload({ payload }: { payload: SharePayload }) {
  return <SharedPuffComparison name={payload.n} logs={payload.logs} />
}

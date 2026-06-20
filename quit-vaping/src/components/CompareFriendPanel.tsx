import { useMemo, useState } from 'react'
import { Copy, Link2, X } from 'lucide-react'
import { PuffPeriodTracker } from './PuffPeriodTracker'
import {
  buildShareUrl,
  encodeShareCode,
  type DiaryPeriod,
  type PuffLogs,
} from '../utils/puffDiary'

interface CompareFriendPanelProps {
  open: boolean
  onClose: () => void
  yourName: string
  yourLogs: PuffLogs
  onNameChange: (name: string) => void
  period: DiaryPeriod
  onPeriodChange: (period: DiaryPeriod) => void
}

export function CompareFriendPanel({
  open,
  onClose,
  yourName,
  yourLogs,
  onNameChange,
  period,
  onPeriodChange,
}: CompareFriendPanelProps) {
  const [copied, setCopied] = useState(false)

  const shareCode = useMemo(
    () => encodeShareCode(yourName, yourLogs),
    [yourName, yourLogs],
  )
  const shareLink = useMemo(() => buildShareUrl(shareCode), [shareCode])

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Compare with friend</h3>
            <p className="text-sm text-slate-500">
              Share your link — friends see your puffs and cigarettes, tracked weekly or longer
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Your display name
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Your name"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Link2 className="h-4 w-4 text-brand-600" />
              Your share link
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Send this link to a friend. They see your puffs and cigarette count for the last 7,
              14 or 30 days. Copy again after logging to share your latest progress.
            </p>
            <input
              readOnly
              value={shareLink}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <PuffPeriodTracker
            logs={yourLogs}
            period={period}
            onPeriodChange={onPeriodChange}
            title="What your friend will see"
            subtitle="Your saved logs on this device — updates when you copy the link again"
          />
        </div>
      </div>
    </div>
  )
}

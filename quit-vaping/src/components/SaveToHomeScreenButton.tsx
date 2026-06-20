import { useEffect, useState } from 'react'
import { Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function SaveToHomeScreenButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleClick() {
    if (installed) return

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstalled(true)
      }
      setDeferredPrompt(null)
      return
    }

    setShowHelp(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={installed}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-default disabled:border-brand-200 disabled:bg-brand-50 disabled:text-brand-700"
      >
        <Smartphone className="h-4 w-4" />
        {installed ? 'Saved to home screen' : 'Save to home screen'}
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Save to home screen</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick access to log your puffs each day
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIosDevice() ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                <li>Tap the Share button in Safari</li>
                <li>Select <strong>Add to Home Screen</strong></li>
                <li>Tap <strong>Add</strong></li>
              </ol>
            ) : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                <li>Open your browser menu (⋮ or ⋯)</li>
                <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                <li>Confirm to add Quit Vaping</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}

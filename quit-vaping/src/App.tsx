import { useState } from 'react'
import { CalculatorTabs, type CalculatorTab } from './components/CalculatorTabs'
import { CompareFriendPanel } from './components/CompareFriendPanel'
import { CostComparison } from './components/CostComparison'
import { ELiquidCalculator } from './components/ELiquidCalculator'
import { Footer } from './components/Footer'
import { SharedPuffComparisonFromPayload } from './components/SharedPuffComparison'
import { Header } from './components/Header'
import { InfoBanner } from './components/InfoBanner'
import { ProductRecommendations } from './components/ProductRecommendations'
import { PuffCalculator } from './components/PuffCalculator'
import { usePuffDiary } from './hooks/usePuffDiary'
import { readSharePayloadFromUrl, type SharePayload } from './utils/puffDiary'

export function App() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('eliquid')
  const [nicotineMg, setNicotineMg] = useState(10)
  const [volumeMl, setVolumeMl] = useState(10)
  const [puffs, setPuffs] = useState(200)
  const [cigarettesPerDay, setCigarettesPerDay] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [sharedFriend] = useState<SharePayload | null>(() => readSharePayloadFromUrl())
  const diary = usePuffDiary()

  return (
    <div className="flex min-h-screen flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Vape to Cigarette Calculator
          </h1>
          <p className="mt-2 text-lg text-brand-100">
            Understand your nicotine intake — then step down and quit
          </p>
          <p className="mt-1 text-sm text-brand-200/80">
            Free tool by Quit Vaping
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div id="calculator" className="scroll-mt-4 space-y-6">
          <InfoBanner />

          {sharedFriend && (
            <SharedPuffComparisonFromPayload payload={sharedFriend} />
          )}

          <CalculatorTabs
            active={activeTab}
            onChange={setActiveTab}
            onChallengeClick={() => {
              setActiveTab('puff')
              setChallengeOpen(true)
            }}
          />

          {activeTab === 'eliquid' && (
            <ELiquidCalculator
              nicotineMg={nicotineMg}
              volumeMl={volumeMl}
              onNicotineChange={setNicotineMg}
              onVolumeChange={setVolumeMl}
            />
          )}
          {activeTab === 'puff' && (
            <PuffCalculator
              puffs={puffs}
              onPuffsChange={setPuffs}
              logs={diary.logs}
              setLogs={diary.setLogs}
              profileName={diary.profileName}
              period={diary.period}
              setPeriod={diary.setPeriod}
            />
          )}
          {activeTab === 'cost' && (
            <CostComparison
              cigarettesPerDay={cigarettesPerDay}
              onCigarettesChange={setCigarettesPerDay}
            />
          )}

          <ProductRecommendations
            currentNicotineMg={nicotineMg}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            volumeMl={volumeMl}
            onNicotineChange={setNicotineMg}
            onVolumeChange={setVolumeMl}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              How Does This Calculator Work?
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Nicotine Comparison Method
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Our calculator compares the total nicotine content between
                  e-liquids and cigarettes. While this provides a useful baseline,
                  remember that nicotine absorption rates differ significantly
                  between smoking (5%) and vaping (50%).
                </p>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                  (Nicotine mg/ml × Volume ml) ÷ Cigarette nicotine content =
                  Equivalent cigarettes
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Important Considerations
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                  <li>Vaping and smoking deliver nicotine differently</li>
                  <li>Individual usage patterns vary greatly</li>
                  <li>This tool provides estimates, not medical advice</li>
                  <li>Consult healthcare professionals for cessation support</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      <CompareFriendPanel
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        yourName={diary.profileName}
        yourLogs={diary.logs}
        onNameChange={diary.updateProfileName}
        period={diary.period}
        onPeriodChange={diary.setPeriod}
      />

      <Footer />
    </div>
  )
}

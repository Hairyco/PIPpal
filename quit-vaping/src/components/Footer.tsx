export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-white">Quit Vaping</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              We help you understand your nicotine intake and find lower-strength
              alternatives. Product links may earn us a commission at no extra cost
              to you — we compare prices across trusted UK vape retailers.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Affiliate Disclosure
            </a>
            <a href="#" className="transition hover:text-white">
              Contact
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Quit Vaping. For adults 18+ only. This
            tool provides estimates, not medical advice. Consult a healthcare
            professional for personalised cessation support.
          </p>
        </div>
      </div>
    </footer>
  )
}

import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion } from 'framer-motion';

const DAILY_RATES = { standard: 73.90, enhanced: 110.40 };
const MOBILITY_RATES = { standard: 29.20, enhanced: 77.05 };

function getAwardLevel(points: number) {
  if (points >= 12) return 'enhanced';
  if (points >= 8) return 'standard';
  return 'none';
}

export function PointsEstimatorUpload() {
  const { goBack, hasPaid, navigateTo } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!hasPaid) { navigateTo('upsell'); return; }
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setIsAnalysing(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Analyse this PIP decision letter or form and extract the descriptor scores. 

Document text:
${text.slice(0, 8000)}

Reply with ONLY valid JSON in this format (no markdown, no extra text):
{
  "documentType": "decision letter" or "PIP2 form" or "assessment report" or "unknown",
  "dailyLivingPoints": <number or null>,
  "mobilityPoints": <number or null>,
  "descriptors": [{"activity": "activity name", "descriptor": "A/B/C etc", "points": 0}],
  "outcome": "awarded enhanced daily living and standard mobility" or similar summary string,
  "confidence": "high" or "medium" or "low"
}`,
            medProfile: { conditions: [], medications: '', notes: '' },
            conversationHistory: [],
            userId: null,
          }),
        });
        const data = await response.json();
        const raw = (data.reply || '').replace(/```json\n?/g, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(raw);
          setResult(parsed);
        } catch {
          setError('Could not read the document. Make sure it\'s a text-based PDF or paste the text below.');
        }
        setIsAnalysing(false);
      };
      reader.readAsText(file);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsAnalysing(false);
    }
  };

  const dailyLevel = result ? getAwardLevel(result.dailyLivingPoints ?? 0) : null;
  const mobilityLevel = result ? getAwardLevel(result.mobilityPoints ?? 0) : null;
  const weeklyTotal = result ? (
    (dailyLevel === 'enhanced' ? DAILY_RATES.enhanced : dailyLevel === 'standard' ? DAILY_RATES.standard : 0) +
    (mobilityLevel === 'enhanced' ? MOBILITY_RATES.enhanced : mobilityLevel === 'standard' ? MOBILITY_RATES.standard : 0)
  ) : 0;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-stone-900 text-base">Points Estimator</h1>
          <p className="text-xs text-stone-500">Upload your decision letter or PIP form</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* Explainer */}
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-teal-300" />
            <h2 className="font-bold text-base">What does this do?</h2>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed">
            Upload your DWP decision letter, PIP2 form, or PA4 assessment report. PIPpal will read the document, identify your descriptor scores, and calculate your estimated weekly and monthly payment.
          </p>
        </div>

        {/* Upload area */}
        {!result && (
          <div
            onClick={() => inputRef.current?.click()}
            className="bg-white rounded-2xl border-2 border-dashed border-stone-200 hover:border-teal-300 transition-all cursor-pointer p-8 text-center active:scale-[0.99]"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload className="w-8 h-8 text-stone-300 mx-auto mb-3" />
            <p className="font-semibold text-stone-700 text-sm mb-1">Tap to upload your document</p>
            <p className="text-xs text-stone-400">PDF, Word, or text file · Decision letter, PIP2 form, or PA4 report</p>
          </div>
        )}

        {/* File selected */}
        {file && !result && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900 text-sm truncate">{file.name}</p>
              <p className="text-xs text-stone-400">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={handleAnalyse}
              disabled={isAnalysing}
              className="bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {isAnalysing ? 'Reading...' : 'Analyse'}
            </button>
          </div>
        )}

        {/* Loading */}
        {isAnalysing && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
            <div className="flex gap-1 justify-center mb-3">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: `${i*150}ms`}} />)}
            </div>
            <p className="text-sm text-stone-500">Reading your document…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Payment summary */}
            {weeklyTotal > 0 && (
              <div className="bg-teal-700 rounded-2xl p-5 text-white text-center">
                <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">Estimated payment</p>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl font-black">£{weeklyTotal.toFixed(2)}</span>
                  <span className="text-teal-300">/ week</span>
                </div>
                <p className="text-teal-200 text-sm font-semibold">~£{(weeklyTotal * 52 / 12).toFixed(0)}/month · tax-free</p>
              </div>
            )}

            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 border ${dailyLevel === 'enhanced' ? 'bg-teal-50 border-teal-200' : dailyLevel === 'standard' ? 'bg-blue-50 border-blue-200' : 'bg-stone-50 border-stone-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Daily Living</p>
                <p className={`text-2xl font-black ${dailyLevel === 'enhanced' ? 'text-teal-700' : dailyLevel === 'standard' ? 'text-blue-700' : 'text-stone-400'}`}>{result.dailyLivingPoints ?? '—'}</p>
                <p className={`text-xs font-semibold mt-0.5 ${dailyLevel === 'enhanced' ? 'text-teal-600' : dailyLevel === 'standard' ? 'text-blue-600' : 'text-stone-400'}`}>
                  {dailyLevel === 'enhanced' ? 'Enhanced' : dailyLevel === 'standard' ? 'Standard' : 'No award'}
                </p>
              </div>
              <div className={`rounded-2xl p-4 border ${mobilityLevel === 'enhanced' ? 'bg-teal-50 border-teal-200' : mobilityLevel === 'standard' ? 'bg-blue-50 border-blue-200' : 'bg-stone-50 border-stone-200'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Mobility</p>
                <p className={`text-2xl font-black ${mobilityLevel === 'enhanced' ? 'text-teal-700' : mobilityLevel === 'standard' ? 'text-blue-700' : 'text-stone-400'}`}>{result.mobilityPoints ?? '—'}</p>
                <p className={`text-xs font-semibold mt-0.5 ${mobilityLevel === 'enhanced' ? 'text-teal-600' : mobilityLevel === 'standard' ? 'text-blue-600' : 'text-stone-400'}`}>
                  {mobilityLevel === 'enhanced' ? 'Enhanced' : mobilityLevel === 'standard' ? 'Standard' : 'No award'}
                </p>
              </div>
            </div>

            {/* Outcome */}
            {result.outcome && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <p className="font-semibold text-stone-900 text-sm">Document says</p>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{result.outcome}</p>
                <p className="text-[11px] text-stone-400 mt-2">Document type: {result.documentType} · Confidence: {result.confidence}</p>
              </div>
            )}

            {/* Descriptors found */}
            {result.descriptors?.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest px-4 pt-4 pb-2">Descriptors found</p>
                <div className="divide-y divide-stone-50">
                  {result.descriptors.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-stone-700 flex-1">{d.activity}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-500">Descriptor {d.descriptor}</span>
                        <span className={`text-xs font-bold ${d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : d.points >= 2 ? 'text-amber-600' : 'text-stone-400'}`}>{d.points}pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Try again */}
            <button onClick={() => { setResult(null); setFile(null); }} className="w-full text-center text-sm text-stone-400 hover:text-teal-600 py-2 transition-colors">
              Upload a different document
            </button>

          </motion.div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-stone-400 text-center leading-relaxed px-2">
          This is an estimate based on the document text. Your actual payment depends on your full DWP assessment.
        </p>

      </div>
    </div>
  );
}

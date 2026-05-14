import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, CheckCircle2 } from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS, type PIPQuestion } from '../pipQuestions';

function stripHtmlForExport(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseDescriptor(saved: string | undefined, q: PIPQuestion): { code: string; points: number; line: string } | null {
  if (!saved?.trim()) return null;
  const m = saved.trim().match(/^Descriptor\s+([A-Z]+)$/i);
  if (!m) return null;
  const code = m[1].toUpperCase();
  const d = q.descriptors.find((x) => x.code === code);
  if (!d) return { code, points: 0, line: `Descriptor ${code}` };
  return { code, points: d.points, line: `Descriptor ${code} · ${d.points} pts — ${d.text}` };
}

function formatAnswerBody(
  q: PIPQuestion,
  saved: string | undefined,
  details?: { difficulties: string[]; answerText?: string },
): { descriptor: ReturnType<typeof parseDescriptor>; difficulties: string[]; prose: string | null } {
  const descriptor = parseDescriptor(saved, q);
  const difficulties = details?.difficulties?.filter(Boolean) ?? [];
  let prose: string | null = null;
  if (details?.answerText?.trim()) {
    prose = stripHtmlForExport(details.answerText);
  } else if (saved?.trim()) {
    const onlyDescriptor = /^Descriptor\s+[A-Z]+$/i.test(saved.trim());
    if (!onlyDescriptor) {
      prose = stripHtmlForExport(saved);
    }
  }
  return { descriptor, difficulties, prose };
}

function hasAnyStoredContent(
  q: PIPQuestion,
  saved: string | undefined,
  details?: { difficulties: string[]; answerText?: string },
): boolean {
  const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
  return !!(descriptor || difficulties.length || prose);
}

/** Used by QuestionIndex / Home to decide whether to show export CTAs */
export function questionHasStoredAnswer(
  q: PIPQuestion,
  savedAnswers: Record<string, string>,
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>,
): boolean {
  return hasAnyStoredContent(q, savedAnswers[q.id], savedAnswerDetails[q.id]);
}

export function buildAnswersPlainText(opts: {
  savedAnswers: Record<string, string>;
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>;
  cocMode: boolean;
  userLabel?: string;
}): string {
  const { savedAnswers, savedAnswerDetails, cocMode, userLabel } = opts;
  const lines: string[] = [];
  const now = new Date();
  lines.push('PIPPal — Your PIP answers');
  lines.push(`Exported ${now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`);
  if (userLabel) lines.push(`Account / name: ${userLabel}`);
  lines.push(`Walkthrough: ${cocMode ? 'Change of circumstances' : 'PIP questions'}`);
  lines.push('');
  lines.push('—'.repeat(48));

  const sections: { title: string; qs: PIPQuestion[] }[] = [
    { title: 'Daily Living', qs: PIP_QUESTIONS.filter((q) => q.category === 'Daily Living') },
    { title: 'Mobility', qs: PIP_QUESTIONS.filter((q) => q.category === 'Mobility') },
  ];

  for (const sec of sections) {
    lines.push('');
    lines.push(sec.title.toUpperCase());
    lines.push('—'.repeat(48));

    for (const q of sec.qs) {
      const saved = savedAnswers[q.id];
      const details = savedAnswerDetails[q.id];
      const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
      const has = hasAnyStoredContent(q, saved, details);

      lines.push('');
      lines.push(`Activity ${q.num}: ${q.title}`);
      lines.push(q.headline);
      if (q.subtext?.trim()) lines.push(q.subtext);
      lines.push(`Form reference: ${q.pipFormRef}`);
      if (!has) {
        lines.push('(Not answered yet in PIPpal)');
        continue;
      }
      if (descriptor) lines.push(descriptor.line);
      if (difficulties.length) {
        lines.push('Difficulties selected:');
        difficulties.forEach((t) => lines.push(`  • ${t}`));
      }
      if (prose) {
        lines.push('Your wording:');
        lines.push(prose);
      } else if (!descriptor && difficulties.length === 0 && saved?.trim()) {
        lines.push(stripHtmlForExport(saved));
      }
    }
  }

  lines.push('');
  lines.push('—'.repeat(48));
  lines.push('PIPpal is a guide — always review before sending to DWP.');
  lines.push('');
  return lines.join('\n');
}

export function AnswersReviewScreen() {
  const {
    goBack,
    savedAnswers,
    savedAnswerDetails,
    cocMode,
    user,
    showToast,
  } = useAppContext();

  const [copied, setCopied] = useState(false);

  const answeredCount = useMemo(
    () => PIP_QUESTIONS.filter((q) => hasAnyStoredContent(q, savedAnswers[q.id], savedAnswerDetails[q.id])).length,
    [savedAnswers, savedAnswerDetails],
  );

  const exportText = useMemo(
    () =>
      buildAnswersPlainText({
        savedAnswers,
        savedAnswerDetails,
        cocMode,
        userLabel: user?.name || user?.email || undefined,
      }),
    [savedAnswers, savedAnswerDetails, cocMode, user?.name, user?.email],
  );

  const downloadTxt = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `PIPPal-PIP-answers-${dateStamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download started', 'success');
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy — try Download instead', 'error');
    }
  };

  const daily = PIP_QUESTIONS.filter((q) => q.category === 'Daily Living');
  const mobility = PIP_QUESTIONS.filter((q) => q.category === 'Mobility');

  const renderQuestion = (q: PIPQuestion) => {
    const saved = savedAnswers[q.id];
    const details = savedAnswerDetails[q.id];
    const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
    const has = hasAnyStoredContent(q, saved, details);

    return (
      <article key={q.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-stone-100 bg-gradient-to-b from-stone-50/90 to-white">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
            {q.category === 'Daily Living' ? `Daily living · ${q.num}` : `Mobility · ${q.num - 10}`}
          </p>
          <h2 className="font-black text-base text-stone-900 leading-snug">{q.title}</h2>
          <p className="text-sm font-semibold text-stone-800 leading-snug mt-2.5">{q.headline}</p>
          {q.subtext?.trim() ? (
            <p className="text-xs text-stone-600 leading-relaxed mt-2">{q.subtext}</p>
          ) : null}
          <p className="text-[10px] text-stone-400 mt-3 leading-snug" title={q.pipFormRef}>
            {q.pipFormRef}
          </p>
        </div>
        <div className="px-4 py-4 space-y-3">
          {!has ? (
            <p className="text-sm text-stone-400 italic">Not answered yet in PIPpal.</p>
          ) : (
            <>
              {descriptor && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                    Descriptor {descriptor.code} · {descriptor.points} pts
                  </span>
                </div>
              )}
              {difficulties.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1.5">What affects you</p>
                  <ul className="space-y-1.5">
                    {difficulties.map((t, i) => (
                      <li key={i} className="text-xs text-stone-700 leading-relaxed flex gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(prose || (!descriptor && difficulties.length === 0 && saved?.trim())) && (
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-1.5">Your answer</p>
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                    {prose ?? stripHtmlForExport(saved!)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <header className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10 print:relative">
        <button
          type="button"
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all print:hidden"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-900 text-lg leading-tight">Your answers</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {answeredCount}/{PIP_QUESTIONS.length} activities with saved detail
            {cocMode ? ' · Change of circumstances' : ''}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-36 print:pb-4">
        <div className="bg-teal-700 px-5 md:px-8 py-5 text-white print:bg-teal-800">
          <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-1">Answer pack</p>
          <p className="text-sm text-teal-100 leading-relaxed">
            Everything PIPpal has stored so far — including partial progress. Download or copy to paste into your PIP2, renewal, or journal.
          </p>
        </div>

        <div className="px-5 md:px-8 py-6 space-y-8 max-w-2xl mx-auto w-full">
          <section className="space-y-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Daily Living</p>
            <div className="space-y-3">{daily.map(renderQuestion)}</div>
          </section>
          <section className="space-y-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Mobility</p>
            <div className="space-y-3">{mobility.map(renderQuestion)}</div>
          </section>

          <p className="text-[11px] text-stone-400 leading-relaxed px-1 print:hidden">
            PIPpal is a guide — double-check wording before you submit anything to DWP.
          </p>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] print:hidden sticky bottom-0">
        <div className="flex gap-2 max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={copyAll}
            className="flex-1 flex items-center justify-center gap-2 bg-stone-100 text-stone-800 py-3.5 rounded-2xl font-bold text-sm hover:bg-stone-200 active:scale-[0.98] transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy all'}
          </button>
          <button
            type="button"
            onClick={downloadTxt}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download (.txt)
          </button>
        </div>
      </div>
    </div>
  );
}

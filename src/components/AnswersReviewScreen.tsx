import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, CheckCircle2, Share2 } from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';
import {
  buildAnswersPlainText,
  buildAnswersDocxBlob,
  stripHtmlForExport,
  questionHasStoredAnswer,
  formatAnswerBody,
} from '../utils/pipAnswersPack';

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
  const [wordBusy, setWordBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const packOpts = useMemo(
    () => ({
      savedAnswers,
      savedAnswerDetails,
      cocMode,
      userLabel: user?.name || user?.email || undefined,
    }),
    [savedAnswers, savedAnswerDetails, cocMode, user?.name, user?.email],
  );

  const answeredCount = useMemo(
    () => PIP_QUESTIONS.filter((q) => questionHasStoredAnswer(q, savedAnswers, savedAnswerDetails)).length,
    [savedAnswers, savedAnswerDetails],
  );

  const exportText = useMemo(() => buildAnswersPlainText(packOpts), [packOpts]);

  const downloadWord = async () => {
    setWordBusy(true);
    try {
      const blob = await buildAnswersDocxBlob(packOpts);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `PIPPal-PIP-answers-${dateStamp}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Word document downloaded', 'success');
    } catch {
      showToast('Could not create Word document', 'error');
    } finally {
      setWordBusy(false);
    }
  };

  const sharePack = async () => {
    setShareBusy(true);
    try {
      const blob = await buildAnswersDocxBlob(packOpts);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const file = new File([blob], `PIPPal-PIP-answers-${dateStamp}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const withFiles: ShareData = {
        title: 'PIPpal — PIP answers',
        text: 'PIP activities and answers exported from PIPpal (Word document attached where supported).',
        files: [file],
      };

      if (navigator.canShare?.(withFiles)) {
        await navigator.share(withFiles);
        showToast('Shared', 'success');
        return;
      }

      const textOnly: ShareData = {
        title: 'PIPpal — PIP answers',
        text: exportText.length > 100_000 ? `${exportText.slice(0, 99_900)}\n\n…(truncated)` : exportText,
      };

      if (navigator.share && (!navigator.canShare || navigator.canShare(textOnly))) {
        await navigator.share(textOnly);
        showToast('Shared text summary', 'success');
        return;
      }

      await navigator.clipboard.writeText(exportText);
      showToast('Copied — file sharing needs a supported browser', 'info');
    } catch (e) {
      const err = e as Error & { name?: string };
      if (err?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(exportText);
        showToast('Copied instead — share unavailable here', 'info');
      } catch {
        showToast('Share failed — try Download Word', 'error');
      }
    } finally {
      setShareBusy(false);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy — try Download Word', 'error');
    }
  };

  const daily = PIP_QUESTIONS.filter((q) => q.category === 'Daily Living');
  const mobility = PIP_QUESTIONS.filter((q) => q.category === 'Mobility');

  const renderQuestion = (q: (typeof PIP_QUESTIONS)[0]) => {
    const saved = savedAnswers[q.id];
    const details = savedAnswerDetails[q.id];
    const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
    const has = !!(descriptor || difficulties.length || prose);

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

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-40 print:pb-4">
        <div className="bg-teal-700 px-5 md:px-8 py-5 text-white print:bg-teal-800">
          <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-1">Answer pack</p>
          <p className="text-sm text-teal-100 leading-relaxed">
            Download a Word document for your records or the form, share it from your phone, or copy plain text to paste elsewhere.
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
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={() => void downloadWord()}
            disabled={wordBusy}
            className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4 shrink-0" />
            {wordBusy ? 'Creating Word…' : 'Download Word (.docx)'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void sharePack()}
              disabled={shareBusy || wordBusy}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              {shareBusy ? '…' : 'Share'}
            </button>
            <button
              type="button"
              onClick={() => void copyAll()}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-100 text-stone-800 py-3 rounded-2xl font-bold text-sm hover:bg-stone-200 active:scale-[0.98] transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, CheckCircle2, Share2, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';
import {
  buildAnswersPlainText,
  buildAnswersDocxBlob,
  stripHtmlForExport,
  questionHasStoredAnswer,
  formatAnswerBody,
  allPipActivitiesComplete,
} from '../utils/pipAnswersPack';

type ReviewCategory = 'new_claim' | 'coc' | 'mr' | 'appeal';

const TAB_LABELS: Record<ReviewCategory, string> = {
  new_claim: 'New claim',
  coc: 'Change of circumstances',
  mr: 'Mandatory reconsideration',
  appeal: 'Appeal',
};

export function AnswersReviewScreen() {
  const {
    goBack,
    savedAnswers,
    savedAnswerDetails,
    savedAnswersNewClaim,
    savedAnswerDetailsNewClaim,
    savedAnswersCoC,
    savedAnswerDetailsCoC,
    mrDraftLetter,
    appealDraftReasons,
    navigateTo,
    setSelectedQuestionId,
    hasPaid,
    user,
    showToast,
    setCocMode,
  } = useAppContext();

  const [reviewTab, setReviewTab] = useState<ReviewCategory>('new_claim');
  const [copied, setCopied] = useState(false);
  const [wordBusy, setWordBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);

  const workbookComplete = allPipActivitiesComplete(savedAnswers, savedAnswerDetails);

  const activeAnswers =
    reviewTab === 'new_claim' ? savedAnswersNewClaim : reviewTab === 'coc' ? savedAnswersCoC : savedAnswers;
  const activeDetails =
    reviewTab === 'new_claim'
      ? savedAnswerDetailsNewClaim
      : reviewTab === 'coc'
        ? savedAnswerDetailsCoC
        : savedAnswerDetails;

  const packOpts = useMemo(() => {
    const label =
      reviewTab === 'new_claim'
        ? 'New claim'
        : reviewTab === 'coc'
          ? 'Change of circumstances'
          : 'PIP questions';
    return {
      savedAnswers: activeAnswers,
      savedAnswerDetails: activeDetails,
      cocMode: reviewTab === 'coc',
      packSectionLabel: label,
      userLabel: user?.name || user?.email || undefined,
    };
  }, [activeAnswers, activeDetails, reviewTab, user?.name, user?.email]);

  const answeredCount = useMemo(
    () => PIP_QUESTIONS.filter((q) => questionHasStoredAnswer(q, activeAnswers, activeDetails)).length,
    [activeAnswers, activeDetails],
  );

  const exportText = useMemo(() => buildAnswersPlainText(packOpts), [packOpts]);

  const mrExportText = useMemo(() => {
    const now = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    return `PIPPal — Mandatory Reconsideration draft\nExported ${now}\n${user?.name || user?.email ? `Account: ${user?.name || user?.email}\n` : ''}\n—\n\n${mrDraftLetter.trim() || '(No draft saved yet)'}\n`;
  }, [mrDraftLetter, user?.name, user?.email]);

  const appealExportText = useMemo(() => {
    const now = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    return `PIPPal — Tribunal appeal grounds (draft)\nExported ${now}\n${user?.name || user?.email ? `Account: ${user?.name || user?.email}\n` : ''}\n—\n\n${appealDraftReasons.trim() || '(No draft saved yet)'}\n`;
  }, [appealDraftReasons, user?.name, user?.email]);

  const downloadWord = async () => {
    if (reviewTab === 'mr' || reviewTab === 'appeal') return;
    setWordBusy(true);
    try {
      const blob = await buildAnswersDocxBlob(packOpts);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);
      const slug = reviewTab === 'coc' ? 'CoC' : 'new-claim';
      a.href = url;
      a.download = `PIPPal-PIP-answers-${slug}-${dateStamp}.docx`;
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
    if (reviewTab === 'mr' || reviewTab === 'appeal') return;
    setShareBusy(true);
    try {
      const blob = await buildAnswersDocxBlob(packOpts);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const slug = reviewTab === 'coc' ? 'CoC' : 'new-claim';
      const file = new File([blob], `PIPPal-PIP-answers-${slug}-${dateStamp}.docx`, {
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
      const body =
        reviewTab === 'mr' ? mrExportText : reviewTab === 'appeal' ? appealExportText : exportText;
      await navigator.clipboard.writeText(body);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy — try again', 'error');
    }
  };

  const daily = PIP_QUESTIONS.filter((q) => q.category === 'Daily Living');
  const mobility = PIP_QUESTIONS.filter((q) => q.category === 'Mobility');

  const openQuestionDraft = (q: (typeof PIP_QUESTIONS)[0]) => {
    if (!hasPaid && !q.free) {
      navigateTo('upsell');
      return;
    }
    if (reviewTab === 'coc') setCocMode(true);
    if (reviewTab === 'new_claim') setCocMode(false);
    setSelectedQuestionId(q.id);
    navigateTo('personalising');
  };

  const renderQuestion = (q: (typeof PIP_QUESTIONS)[0]) => {
    const saved = activeAnswers[q.id];
    const details = activeDetails[q.id];
    const { descriptor, difficulties, prose } = formatAnswerBody(q, saved, details);
    const has = !!(descriptor || difficulties.length || prose);

    return (
      <button
        key={q.id}
        type="button"
        onClick={() => openQuestionDraft(q)}
        className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden w-full text-left cursor-pointer transition-all hover:border-teal-200 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 print:pointer-events-none print:border-stone-100"
        aria-label={`Edit draft for ${q.title}`}
      >
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
            <p className="text-sm text-stone-400 italic">Not answered yet for this category in PIPpal.</p>
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
        {(reviewTab === 'new_claim' || reviewTab === 'coc') && (
          <div className="px-4 py-2.5 bg-teal-50/80 border-t border-teal-100 flex items-center justify-between gap-2 print:hidden">
            <span className="text-[11px] font-semibold text-teal-800">Tap to continue editing</span>
            <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" aria-hidden />
          </div>
        )}
      </button>
    );
  };

  if (!workbookComplete) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <header className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 shrink-0">
          <button
            type="button"
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-stone-900 text-lg leading-tight">Your answers prep</h1>
            <p className="text-xs text-stone-500 mt-0.5">Available after every activity has saved detail</p>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
            Finish all <strong className="text-stone-800">12 activities</strong> in My Questions first. When you&apos;re done,
            open <strong className="text-stone-800">Your answers prep</strong> (Review & download saved answers) from the home screen.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('question_index')}
            className="mt-5 bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-teal-800 active:scale-[0.98] transition-all"
          >
            Go to My Questions
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="font-bold text-stone-900 text-lg leading-tight">Your answers prep</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {(reviewTab === 'new_claim' || reviewTab === 'coc') &&
              `${answeredCount}/${PIP_QUESTIONS.length} activities · ${TAB_LABELS[reviewTab]}`}
            {reviewTab === 'mr' && 'Saved MR wording'}
            {reviewTab === 'appeal' && 'Saved tribunal grounds'}
          </p>
        </div>
      </header>

      <div className="px-5 md:px-8 pt-3 pb-2 bg-white border-b border-stone-100 print:hidden">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 max-w-2xl mx-auto w-full">
          {(Object.keys(TAB_LABELS) as ReviewCategory[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setReviewTab(key)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] ${
                reviewTab === key
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-teal-200'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-40 print:pb-4">
        <div className="bg-teal-700 px-5 md:px-8 py-5 text-white print:bg-teal-800">
          <p className="text-teal-200 text-[10px] font-bold uppercase tracking-widest mb-1">{TAB_LABELS[reviewTab]}</p>
          <p className="text-sm text-teal-100 leading-relaxed">
            {reviewTab === 'new_claim' &&
              'Worksheet drafts for your first PIP claim. Export or edit any activity.'}
            {reviewTab === 'coc' &&
              'Answers updated during a Change of circumstances — starts from where you left your last workbook when you entered CoC.'}
            {reviewTab === 'mr' &&
              'Last Mandatory Reconsideration letter generated in PIPpal. Regenerate anytime from the MR walkthrough.'}
            {reviewTab === 'appeal' &&
              'Last tribunal grounds draft from PIPpal. Regenerate from the Appeal screen.'}
          </p>
        </div>

        <div className="px-5 md:px-8 py-6 space-y-8 max-w-2xl mx-auto w-full">
          {(reviewTab === 'new_claim' || reviewTab === 'coc') && (
            <>
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Daily Living</p>
                <div className="space-y-3">{daily.map(renderQuestion)}</div>
              </section>
              <section className="space-y-3">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Mobility</p>
                <div className="space-y-3">{mobility.map(renderQuestion)}</div>
              </section>
            </>
          )}

          {reviewTab === 'mr' && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
              {!mrDraftLetter.trim() ? (
                <>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    You haven&apos;t saved MR wording yet. Generate it from the Mandatory Reconsideration guide — we store the
                    latest draft here automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('mandatory_reconsideration')}
                    className="w-full py-3 rounded-xl bg-teal-700 text-white text-sm font-bold hover:bg-teal-800 active:scale-[0.98] transition-all"
                  >
                    Open Mandatory Reconsideration
                  </button>
                </>
              ) : (
                <pre className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">{mrDraftLetter}</pre>
              )}
            </div>
          )}

          {reviewTab === 'appeal' && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
              {!appealDraftReasons.trim() ? (
                <>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    No appeal grounds draft saved yet. Generate from the Appeal screen — we keep the latest text here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('appeal')}
                    className="w-full py-3 rounded-xl bg-rose-700 text-white text-sm font-bold hover:bg-rose-800 active:scale-[0.98] transition-all"
                  >
                    Open Appeal to Tribunal
                  </button>
                </>
              ) : (
                <pre className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">{appealDraftReasons}</pre>
              )}
            </div>
          )}

          <p className="text-[11px] text-stone-400 leading-relaxed px-1 print:hidden">
            PIPpal is a guide — double-check wording before you submit anything to DWP.
          </p>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] print:hidden sticky bottom-0">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
          {(reviewTab === 'new_claim' || reviewTab === 'coc') && (
            <>
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
            </>
          )}
          {(reviewTab === 'mr' || reviewTab === 'appeal') && (
            <button
              type="button"
              onClick={() => void copyAll()}
              className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              {copied ? 'Copied' : 'Copy draft text'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

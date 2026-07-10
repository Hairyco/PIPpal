import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  Upload,
  X,
} from 'lucide-react';
import type {
  AnalysisChatMessage,
  AnalysisDocument,
  AnalysisRecommendation,
  MarketAnalysis,
} from '../../utils/marketAnalysis';
import {
  generateAnalysisChatReply,
  readProjectDoc,
} from '../../utils/marketAnalysis';

interface MarketAnalysisStepProps {
  projectName: string;
  analysis: MarketAnalysis;
  onAnalysisChange: (analysis: MarketAnalysis) => void;
  documents: AnalysisDocument[];
  onDocumentsChange: (docs: AnalysisDocument[]) => void;
  chatMessages: AnalysisChatMessage[];
  onChatMessagesChange: (messages: AnalysisChatMessage[]) => void;
  selectedRecommendationIds: string[];
  onSelectedRecommendationIdsChange: (ids: string[]) => void;
  approved: boolean;
  onApprove: () => void;
  onBack: () => void;
  onContinue: () => void;
  categoryId: string;
  description: string;
}

export function MarketAnalysisStep({
  projectName,
  analysis,
  onAnalysisChange,
  documents,
  onDocumentsChange,
  chatMessages,
  onChatMessagesChange,
  selectedRecommendationIds,
  onSelectedRecommendationIdsChange,
  approved,
  onApprove,
  onBack,
  onContinue,
  categoryId,
  description,
}: MarketAnalysisStepProps) {
  const docRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const toggleRecommendation = (id: string) => {
    onSelectedRecommendationIdsChange(
      selectedRecommendationIds.includes(id)
        ? selectedRecommendationIds.filter((x) => x !== id)
        : [...selectedRecommendationIds, id],
    );
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: AnalysisChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };
    onChatMessagesChange([...chatMessages, userMsg]);
    setChatInput('');
    setChatLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const { reply, analysisPatch } = generateAnalysisChatReply({
      message: text,
      projectName,
      categoryId,
      description,
      documents,
      analysis,
    });

    onChatMessagesChange([
      ...chatMessages,
      userMsg,
      { id: `rex-${Date.now()}`, role: 'rex', text: reply },
    ]);

    if (analysisPatch) {
      onAnalysisChange({
        ...analysis,
        strengths: analysisPatch.strengths ?? analysis.strengths,
        weaknesses: analysisPatch.weaknesses ?? analysis.weaknesses,
        recommendations: analysisPatch.recommendations ?? analysis.recommendations,
        fitLabel: analysisPatch.fitLabel ?? analysis.fitLabel,
        overview: analysisPatch.overview ?? analysis.overview,
      });
      const newRecIds = (analysisPatch.recommendations ?? analysis.recommendations).map(
        (r) => r.id,
      );
      onSelectedRecommendationIdsChange([
        ...new Set([...selectedRecommendationIds, ...newRecIds]),
      ]);
    }

    setChatLoading(false);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDocUpload = async (files: FileList | null) => {
    if (!files?.length || docLoading) return;
    setDocError(null);
    setDocLoading(true);

    try {
      const added: AnalysisDocument[] = [];
      for (const file of Array.from(files).slice(0, 3)) {
        added.push(await readProjectDoc(file));
      }
      onDocumentsChange([...documents, ...added]);

      onChatMessagesChange([
        ...chatMessages,
        {
          id: `rex-doc-${Date.now()}`,
          role: 'rex',
          text: `Received ${added.map((d) => d.name).join(', ')}. I will factor this into your market analysis — ask me to highlight risks or suggest copy changes based on the upload.`,
        },
      ]);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setDocLoading(false);
    }
  };

  const removeDoc = (id: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1] space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20">
                <BarChart3 className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                  Market analysis
                </p>
                <h2 className="mt-1 font-semibold text-white">
                  {projectName || 'Your project'}
                </h2>
              </div>
            </div>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
              {analysis.fitLabel}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{analysis.overview}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <AnalysisList
              title="Strengths"
              icon={ThumbsUp}
              tone="emerald"
              items={analysis.strengths.map((p) => p.text)}
            />
            <AnalysisList
              title="Weak points"
              icon={ThumbsDown}
              tone="amber"
              items={analysis.weaknesses.map((p) => p.text)}
            />
          </div>

          {analysis.recommendations.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Rex recommended changes — select what to apply
              </p>
              <div className="space-y-2">
                {analysis.recommendations.map((rec) => (
                  <RecommendationRow
                    key={rec.id}
                    rec={rec}
                    selected={selectedRecommendationIds.includes(rec.id)}
                    disabled={approved}
                    onToggle={() => toggleRecommendation(rec.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {!approved ? (
            <button
              type="button"
              onClick={onApprove}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15"
            >
              <Check className="h-4 w-4" />
              Approve selected changes
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <Check className="h-4 w-4 shrink-0" />
              Analysis approved — continue to your Rex concept summary
            </div>
          )}
        </div>
      </div>

      <div className="dex-card">
        <div className="relative z-[1] space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Discuss with Rex</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Ask about competition, audience, risks, or your uploaded materials. Rex will interpret
            and update advice.
          </p>

          <div className="max-h-52 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                e.g. “Who are my main competitors?” or “Does this fit prelaunch?”
              </p>
            )}
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-500/20 text-sky-100'
                      : 'border border-white/10 bg-white/[0.04] text-muted-foreground'
                  }`}
                >
                  {msg.role === 'rex' && (
                    <span className="mb-1 block text-[10px] font-medium text-sky-400">Rex</span>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Rex is thinking…
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              placeholder="Ask Rex about your market fit…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSendChat();
                }
              }}
            />
            <button
              type="button"
              disabled={!chatInput.trim() || chatLoading}
              onClick={() => void handleSendChat()}
              className="shrink-0 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-2 text-sky-200 transition-colors hover:bg-sky-500/25 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Supporting documents
              </label>
              <span className="text-[10px] text-muted-foreground">.txt, .md, .csv, .json · max 3</span>
            </div>

            {documents.length > 0 && (
              <ul className="mb-3 space-y-1.5">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="truncate text-xs text-white">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="shrink-0 text-muted-foreground hover:text-white"
                      aria-label={`Remove ${doc.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <input
              ref={docRef}
              type="file"
              accept=".txt,.md,.markdown,.csv,.json,text/plain,text/markdown,text/csv,application/json"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleDocUpload(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={docLoading || documents.length >= 3}
              onClick={() => docRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-sky-500/30 disabled:opacity-40"
            >
              {docLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload docs
            </button>
            {docError && <p className="mt-1.5 text-[10px] text-rose-400">{docError}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          disabled={!approved}
          onClick={onContinue}
          className="dex-btn disabled:opacity-40"
        >
          Continue to Rex summary
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AnalysisList({
  title,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  icon: typeof ThumbsUp;
  tone: 'emerald' | 'amber';
  items: string[];
}) {
  const border = tone === 'emerald' ? 'border-emerald-500/20' : 'border-amber-500/20';
  const bg = tone === 'emerald' ? 'bg-emerald-500/[0.06]' : 'bg-amber-500/[0.06]';
  const iconColor = tone === 'emerald' ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className={`rounded-xl border ${border} ${bg} p-3`}>
      <p className={`mb-2 flex items-center gap-1.5 text-xs font-medium ${iconColor}`}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((text) => (
          <li key={text} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationRow({
  rec,
  selected,
  disabled,
  onToggle,
}: {
  rec: AnalysisRecommendation;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-default ${
        selected
          ? 'border-sky-500/40 bg-sky-500/10'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          selected ? 'border-sky-400 bg-sky-500/30' : 'border-white/20 bg-transparent'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-sky-200" />}
      </span>
      <span>
        <p className="text-sm font-medium text-white">{rec.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{rec.detail}</p>
      </span>
    </button>
  );
}

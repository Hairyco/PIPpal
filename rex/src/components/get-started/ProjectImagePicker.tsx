import { useRef, useState } from 'react';
import { Coins, ImagePlus, Sparkles, Upload, Wand2 } from 'lucide-react';
import { REX_GENERATE_IMAGE_COST, REX_TOKEN_SYMBOL } from '../../data/rexToken';
import { generateProjectImageDataUrl, readImageFile } from '../../utils/projectImageGenerate';
import {
  getRexTokenBalance,
  spendRexTokens,
} from '../../utils/rexTokenWallet';
import { BuyRexTokenModal, RexTokenBadge } from './BuyRexTokenModal';

export type ProjectImageSource = 'upload' | 'generated' | null;

interface ProjectImagePickerProps {
  imageUrl: string | null;
  imageSource: ProjectImageSource;
  onChange: (url: string | null, source: ProjectImageSource) => void;
  projectName: string;
  description: string;
  categoryLabel?: string;
}

type Mode = 'upload' | 'generate';

export function ProjectImagePicker({
  imageUrl,
  imageSource,
  onChange,
  projectName,
  description,
  categoryLabel,
}: ProjectImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>(imageSource === 'generated' ? 'generate' : 'upload');
  const [rexBalance, setRexBalance] = useState(getRexTokenBalance);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploadError(null);
    try {
      const dataUrl = await readImageFile(file);
      onChange(dataUrl, 'upload');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    if (!projectName.trim()) {
      setGenerateError('Enter a project name first');
      return;
    }

    const spend = spendRexTokens(REX_GENERATE_IMAGE_COST);
    if (!spend.ok) {
      setBuyModalOpen(true);
      return;
    }
    setRexBalance(spend.balance);

    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const dataUrl = generateProjectImageDataUrl({
      projectName,
      description,
      categoryLabel,
    });
    setGenerating(false);
    if (dataUrl) {
      onChange(dataUrl, 'generated');
    } else {
      setGenerateError('Generation failed — try again');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-medium text-muted-foreground">Project image</label>
        <RexTokenBadge balance={rexBalance} />
      </div>

      {/* Preview */}
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <ImagePlus className="h-6 w-6 opacity-50" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
          {imageSource && (
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white/80">
              {imageSource === 'upload' ? 'Uploaded' : 'AI'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
            <ModeTab active={mode === 'upload'} onClick={() => setMode('upload')} icon={<Upload className="h-3.5 w-3.5" />} label="Upload" />
            <ModeTab
              active={mode === 'generate'}
              onClick={() => setMode('generate')}
              icon={<Wand2 className="h-3.5 w-3.5" />}
              label="Generate"
            />
          </div>

          {mode === 'upload' ? (
            <div className="mt-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-sky-500/30"
              >
                <Upload className="h-3.5 w-3.5" />
                Choose image
              </button>
              <p className="mt-1.5 text-[10px] text-muted-foreground">PNG, JPG, WebP or GIF · max 2 MB · free</p>
              {uploadError && <p className="mt-1 text-[10px] text-rose-400">{uploadError}</p>}
            </div>
          ) : (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg bg-rex-gradient px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {generating ? (
                  <>Generating…</>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate with AI
                  </>
                )}
              </button>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Coins className="h-3 w-3" />
                Costs {REX_GENERATE_IMAGE_COST} {REX_TOKEN_SYMBOL} per generation
              </p>
              {generateError && <p className="mt-1 text-[10px] text-rose-400">{generateError}</p>}
              {rexBalance < REX_GENERATE_IMAGE_COST && (
                <button
                  type="button"
                  onClick={() => setBuyModalOpen(true)}
                  className="mt-2 text-xs font-medium text-sky-400 hover:text-sky-300"
                >
                  Buy {REX_TOKEN_SYMBOL} token →
                </button>
              )}
            </div>
          )}

          {imageUrl && (
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="mt-2 text-[10px] text-muted-foreground hover:text-rose-400"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      <BuyRexTokenModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        requiredAmount={REX_GENERATE_IMAGE_COST}
        onPurchased={(balance) => setRexBalance(balance)}
      />
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors ${
        active ? 'bg-sky-500/15 text-sky-400' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

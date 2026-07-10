import { useRef, useState } from 'react';
import { Link2, Upload, X } from 'lucide-react';
import { readImageFile } from '../../utils/projectImageGenerate';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

const MAX_ASSETS = 6;

interface ExistingProjectAssetsProps {
  productUrl: string;
  onProductUrlChange: (url: string) => void;
  assets: string[];
  onAssetsChange: (assets: string[]) => void;
}

export function ExistingProjectAssets({
  productUrl,
  onProductUrlChange,
  assets,
  onAssetsChange,
}: ExistingProjectAssetsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);

    const remaining = MAX_ASSETS - assets.length;
    if (remaining <= 0) {
      setUploadError(`Maximum ${MAX_ASSETS} assets`);
      return;
    }

    const toAdd: string[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      try {
        toAdd.push(await readImageFile(file));
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
        break;
      }
    }

    if (toAdd.length) {
      onAssetsChange([...assets, ...toAdd]);
    }
  };

  const removeAsset = (index: number) => {
    onAssetsChange(assets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Your existing product</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Link your live site or app and upload logos, screenshots, or brand assets. Rex uses these
          for your token page and marketing.
        </p>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Website or product URL
        </label>
        <input
          className={inputClass}
          placeholder="https://yourproduct.com or App Store link"
          value={productUrl}
          onChange={(e) => onProductUrlChange(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground">Brand & product assets</label>
          <span className="text-[10px] text-muted-foreground">
            {assets.length}/{MAX_ASSETS}
          </span>
        </div>

        {assets.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {assets.map((asset, index) => (
              <div
                key={`${index}-${asset.slice(0, 24)}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/20"
              >
                <img src={asset} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove asset"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          disabled={assets.length >= MAX_ASSETS}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-sky-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload assets
        </button>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Logos, app screenshots, hero images · PNG, JPG, WebP or GIF · max 2 MB each
        </p>
        {uploadError && <p className="mt-1 text-[10px] text-rose-400">{uploadError}</p>}
      </div>
    </div>
  );
}

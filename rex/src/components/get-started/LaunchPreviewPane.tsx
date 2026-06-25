import { X } from 'lucide-react';
import { LaunchPreview, type LaunchPreviewData } from './LaunchPreview';

interface LaunchPreviewPaneProps {
  data: LaunchPreviewData;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

function PaneHeader({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0e17] px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-sky-400">Preview pane</p>
        <p className="text-[10px] text-muted-foreground">Updates live as you edit</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          Live
        </span>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close preview pane"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LaunchPreviewPane({
  data,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}: LaunchPreviewPaneProps) {
  return (
    <>
      {/* Tablet+ — fixed right pane, always visible */}
      <aside className="hidden w-[min(380px,42vw)] shrink-0 flex-col border-l border-white/10 bg-[#060a12] md:flex md:sticky md:top-0 md:h-[calc(100vh-4rem)]">
        <PaneHeader />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <LaunchPreview data={data} inPane />
        </div>
      </aside>

      {/* Mobile slide-over + FAB */}
      <div className="md:hidden">
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={onMobileClose}
              aria-hidden
            />
            <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#060a12] shadow-2xl">
              <PaneHeader onClose={onMobileClose} showClose />
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <LaunchPreview data={data} inPane />
              </div>
            </aside>
          </>
        )}

        {!mobileOpen && (
          <button
            type="button"
            onClick={onMobileOpen}
            className="fixed bottom-6 right-6 z-30 rounded-full border border-sky-500/30 bg-[#0a0e17] px-4 py-2.5 text-sm font-medium text-sky-400 shadow-lg transition-colors hover:bg-sky-500/10"
          >
            Show preview in pane
          </button>
        )}
      </div>
    </>
  );
}

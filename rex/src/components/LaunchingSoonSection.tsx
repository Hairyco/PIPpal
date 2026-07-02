import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';
import {
  demoLaunchingSoonProjects,
  formatLaunchDate,
  type LaunchingSoonProject,
} from '../data/launchingSoon';
import { TokenIcon } from './TokenIcon';

function LaunchingSoonCard({ project }: { project: LaunchingSoonProject }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(project.likeCount);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const toggleLike = () => {
    setLiked((prev) => {
      setLikes((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/trade#${project.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, text: project.tagline, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareNote('Link copied');
        setTimeout(() => setShareNote(null), 2000);
      }
    } catch {
      // cancelled
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-sky-500/25 hover:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <TokenIcon symbol={project.symbol} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-white">{project.name}</p>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-200">
              Launching soon
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{project.categoryName}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{project.tagline}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3 text-sky-400" />
          {formatLaunchDate(project.targetLaunchDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3 text-sky-400" />
          {project.followerCount.toLocaleString()} following
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            liked
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border-white/15 bg-white/5 text-muted-foreground hover:text-white'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
          {likes.toLocaleString()}
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
          {project.commentCount} comments
        </span>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-sky-400/40 hover:text-white"
        >
          <Share2 className="h-3.5 w-3.5 text-sky-400" />
          Share
        </button>
        {shareNote && <span className="text-[10px] text-sky-400">{shareNote}</span>}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-sky-400/40 hover:bg-white/10"
      >
        <Bell className="h-3.5 w-3.5 text-sky-400" />
        Notify me
      </button>
    </div>
  );
}

interface LaunchingSoonSectionProps {
  founderProject?: LaunchingSoonProject | null;
  showHeader?: boolean;
}

export function LaunchingSoonSection({
  founderProject,
  showHeader = true,
}: LaunchingSoonSectionProps) {
  const projects = [
    ...(founderProject ? [founderProject] : []),
    ...demoLaunchingSoonProjects.filter((p) => p.id !== founderProject?.id),
  ].slice(0, 6);

  if (projects.length === 0) return null;

  return (
    <section aria-label="Launching soon">
      {showHeader && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400/90">
              Launching soon
            </p>
            <h2 className="mt-1 font-serif text-xl font-bold text-white sm:text-2xl">
              Build buzz before you trade
            </h2>
          </div>
          <Link
            to="/get-started"
            className="shrink-0 text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            List your project →
          </Link>
        </div>
      )}
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${showHeader ? 'mt-6' : ''}`}>
        {projects.map((project) => (
          <LaunchingSoonCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

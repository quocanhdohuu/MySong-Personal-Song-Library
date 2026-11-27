import { CheckCircle2, Circle, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../../types/song';
import { ToneBadge } from '../common/ToneBadge';

interface SongListItemProps {
  song: Song;
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
}

export function SongListItem({
  song,
  onToggleFavorite,
  onToggleLearned,
}: SongListItemProps) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/songs/${song.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/songs/${song.id}`);
        }
      }}
      className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/70 px-3.5 py-3 transition-colors active:bg-zinc-800/80"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-zinc-100">{song.name}</h3>
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-400">{song.artist}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ToneBadge tone={song.tone} />
          {song.score !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-purple-300">
              <Star className="h-3 w-3 fill-purple-400 text-purple-400" />
              {song.score}
            </span>
          )}
          {song.isLearned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              Đã thuộc
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLearned(song.id);
          }}
          aria-label={song.isLearned ? 'Đánh dấu chưa thuộc' : 'Đánh dấu đã thuộc'}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95 ${
            song.isLearned
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          {song.isLearned ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(song.id);
          }}
          aria-label={song.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:scale-95 ${
            song.isFavorite
              ? 'bg-rose-500/15 text-rose-400'
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
        >
          <Heart className={`h-5 w-5 ${song.isFavorite ? 'fill-rose-400' : ''}`} />
        </button>
      </div>
    </div>
  );
}

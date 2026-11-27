import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Edit3,
  ExternalLink,
  FileText,
  Heart,
  Link2,
  Shuffle,
  Star,
  Trash2,
} from 'lucide-react';
import { useSong, useSongs } from '../../hooks/useSongs';
import { useToast } from '../../hooks/useToast';
import { deleteSong, toggleFavorite, toggleLearned } from '../../services/songService';
import { pickRandomSong } from '../../services/randomService';
import { ToneBadge } from '../../components/common/ToneBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const fromRandom = searchParams.get('from') === 'random';
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { song, isLoading } = useSong(id);
  const { songs } = useSongs();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleToggleFavorite = async () => {
    if (!song) return;
    try {
      const updated = await toggleFavorite(song.id);
      showToast(updated.isFavorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích', 'info');
    } catch {
      showToast('Không thể cập nhật yêu thích', 'error');
    }
  };

  const handleToggleLearned = async () => {
    if (!song) return;
    try {
      const updated = await toggleLearned(song.id);
      showToast(updated.isLearned ? 'Đã đánh dấu đã thuộc' : 'Đã đánh dấu chưa thuộc', 'info');
    } catch {
      showToast('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleDelete = async () => {
    if (!song) return;
    try {
      await deleteSong(song.id);
      showToast('Đã xóa bài hát', 'info');
      navigate('/library', { replace: true });
    } catch {
      showToast('Không thể xóa bài hát', 'error');
    }
  };

  const handleAnotherRandom = () => {
    const next = pickRandomSong(songs, {
      tone: 'ALL',
      status: 'ALL',
      excludeId: song?.id,
    });
    if (next) {
      navigate(`/songs/${next.id}?from=random`, { replace: true });
    } else {
      showToast('Không còn bài hát nào khác', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-900" />
        <div className="h-56 animate-pulse rounded-3xl bg-zinc-900" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-400">Không tìm thấy bài hát này.</p>
        <Link
          to="/library"
          className="mt-4 inline-block rounded-2xl bg-zinc-800 px-4 py-2 text-sm text-zinc-200"
        >
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 active:scale-95"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/songs/${song.id}/edit`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-sm font-medium text-zinc-200 active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            Sửa
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 active:scale-95"
            aria-label="Xóa bài hát"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Info Card */}
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-snug text-zinc-50">{song.name}</h1>
            <p className="mt-1 text-base text-zinc-400">{song.artist}</p>
          </div>
          {song.score !== null && (
            <div className="flex shrink-0 flex-col items-center rounded-2xl border border-purple-500/30 bg-purple-500/15 px-3 py-2">
              <div className="flex items-center gap-1 text-lg font-bold text-purple-200">
                <Star className="h-4 w-4 fill-purple-400 text-purple-400" />
                {song.score}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-purple-300/80">Điểm</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ToneBadge tone={song.tone} />
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              song.isLearned
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border-zinc-700 bg-zinc-800 text-zinc-400'
            }`}
          >
            {song.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}
          </span>
          {song.isFavorite && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-300">
              <Heart className="h-3 w-3 fill-rose-400" />
              Yêu thích
            </span>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors active:scale-[0.98] ${
              song.isFavorite
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
            }`}
          >
            <Heart className={`h-4 w-4 ${song.isFavorite ? 'fill-rose-400' : ''}`} />
            {song.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
          </button>

          <button
            type="button"
            onClick={handleToggleLearned}
            className={`flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors active:scale-[0.98] ${
              song.isLearned
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
            }`}
          >
            {song.isLearned ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {song.isLearned ? 'Đã thuộc' : 'Đánh dấu thuộc'}
          </button>
        </div>
      </section>

      {/* YouTube Link */}
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Liên kết YouTube / Karaoke
          </span>
        </div>

        {song.youtubeUrl ? (
          <a
            href={song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 truncate">
              <ExternalLink className="h-4 w-4 shrink-0" />
              Mở trên YouTube
            </span>
            <span className="ml-2 max-w-[140px] truncate text-xs font-normal text-rose-300/70">
              {song.youtubeUrl}
            </span>
          </a>
        ) : (
          <Link
            to={`/songs/${song.id}/edit`}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200"
          >
            <Link2 className="h-4 w-4" />
            Thêm liên kết YouTube
          </Link>
        )}
      </section>

      {/* Notes */}
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <FileText className="h-3.5 w-3.5" />
          Ghi chú luyện tập
        </div>
        <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
          {song.note ? song.note : <span className="text-zinc-500">Chưa có ghi chú nào.</span>}
        </p>
      </section>

      {/* Metadata */}
      <section className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Ngày tạo
          </span>
          <span className="text-zinc-400">{formatDateTime(song.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Cập nhật
          </span>
          <span className="text-zinc-400">{formatDateTime(song.updatedAt)}</span>
        </div>
      </section>

      {fromRandom && (
        <button
          type="button"
          onClick={handleAnotherRandom}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 active:scale-[0.98]"
        >
          <Shuffle className="h-4 w-4" />
          Chọn bài khác ngẫu nhiên
        </button>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa bài hát?"
        description={`Bạn có chắc chắn muốn xóa "${song.name}" khỏi thư viện?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

import { Heart, CheckCircle2, Music2, Plus, Shuffle, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useSongs } from '../../hooks/useSongs';
import { TONE_LABELS } from '../../constants/song';
import { ToneBadge } from '../../components/common/ToneBadge';
import { EmptyState } from '../../components/common/EmptyState';

export function HomePage() {
  const { songs, isLoading } = useSongs();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = songs.length;
    const favorites = songs.filter((s) => s.isFavorite).length;
    const learned = songs.filter((s) => s.isLearned).length;
    const high = songs.filter((s) => s.tone === 'HIGH').length;
    const medium = songs.filter((s) => s.tone === 'MEDIUM').length;
    const low = songs.filter((s) => s.tone === 'LOW').length;
    const recent = [...songs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
    return { total, favorites, learned, high, medium, low, recent };
  }, [songs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-purple-500 text-zinc-950">
              <Music2 className="h-4 w-4 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">MySong</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Thư viện bài hát cá nhân của bạn</p>
        </div>

        <Link
          to="/songs/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-500 px-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Thêm bài
        </Link>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/songs/new')}
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-left transition-colors active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">Thêm bài hát</div>
            <div className="text-[11px] text-emerald-300/80">Lưu bài mới</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/random')}
          className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/10 p-3.5 text-left transition-colors active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white">
            <Shuffle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">Ngẫu nhiên</div>
            <div className="text-[11px] text-purple-300/80">Chọn bài để hát</div>
          </div>
        </button>
      </div>

      {/* Overview Stats */}
      <section className="grid grid-cols-3 gap-2.5">
        <Link
          to="/library"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 active:bg-zinc-800"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Tổng số</span>
            <Music2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-50">
            {isLoading ? '–' : stats.total}
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">bài hát</div>
        </Link>

        <Link
          to="/favorites"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 active:bg-zinc-800"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Yêu thích</span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-50">
            {isLoading ? '–' : stats.favorites}
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">xem danh sách</div>
        </Link>

        <Link
          to="/library?status=LEARNED"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 active:bg-zinc-800"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Đã thuộc</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-50">
            {isLoading ? '–' : stats.learned}
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">
            {stats.total > 0 ? `${Math.round((stats.learned / stats.total) * 100)}%` : '0%'}
          </div>
        </Link>
      </section>

      {/* Tone Breakdown */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Phân bố theo Tone</h2>
          <Sparkles className="h-4 w-4 text-purple-400" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(
            [
              { key: 'HIGH', count: stats.high, color: 'text-rose-300', bar: 'bg-rose-500' },
              { key: 'MEDIUM', count: stats.medium, color: 'text-amber-300', bar: 'bg-amber-500' },
              { key: 'LOW', count: stats.low, color: 'text-emerald-300', bar: 'bg-emerald-500' },
            ] as const
          ).map((item) => (
            <Link
              key={item.key}
              to={`/library?tone=${item.key}`}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2.5 active:bg-zinc-800"
            >
              <div className={`text-lg font-bold ${item.color}`}>{item.count}</div>
              <div className="text-xs text-zinc-400">{TONE_LABELS[item.key]}</div>
            </Link>
          ))}
        </div>

        {stats.total > 0 && (
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="bg-rose-500 transition-all"
              style={{ width: `${(stats.high / stats.total) * 100}%` }}
            />
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(stats.medium / stats.total) * 100}%` }}
            />
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(stats.low / stats.total) * 100}%` }}
            />
          </div>
        )}
      </section>

      {/* Recently Added */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Mới thêm gần đây</h2>
          {stats.total > 0 && (
            <Link
              to="/library"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        ) : stats.recent.length === 0 ? (
          <EmptyState
            icon={<Music2 className="h-7 w-7" />}
            title="Thư viện chưa có bài hát nào"
            description="Hãy thêm bài hát đầu tiên để bắt đầu quản lý danh sách luyện tập của bạn."
            action={
              <Link
                to="/songs/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950"
              >
                <Plus className="h-4 w-4" />
                Thêm bài hát đầu tiên
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {stats.recent.map((song) => (
              <Link
                key={song.id}
                to={`/songs/${song.id}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/70 px-3.5 py-3 active:bg-zinc-800"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="truncate text-sm font-semibold text-zinc-100">{song.name}</div>
                  <div className="truncate text-xs text-zinc-400">{song.artist}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ToneBadge tone={song.tone} />
                  {song.score !== null && (
                    <span className="text-xs font-semibold text-purple-300">{song.score}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

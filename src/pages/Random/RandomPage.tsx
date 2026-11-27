import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Music2, RefreshCw, Shuffle, Star } from 'lucide-react';
import { STATUS_FILTER_LABELS, TONE_LABELS } from '../../constants/song';
import { useSongs } from '../../hooks/useSongs';
import { getRandomCandidates, pickRandomSong } from '../../services/randomService';
import type { Song, StatusFilter, Tone } from '../../types/song';
import { ToneBadge } from '../../components/common/ToneBadge';
import { EmptyState } from '../../components/common/EmptyState';

export function RandomPage() {
  const { songs, isLoading } = useSongs();
  const [tone, setTone] = useState<Tone | 'ALL'>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<Song | null>(null);
  const [pickCount, setPickCount] = useState(0);

  const candidates = useMemo(
    () => getRandomCandidates(songs, { tone, status }),
    [songs, tone, status]
  );

  const handlePick = () => {
    const picked = pickRandomSong(songs, {
      tone,
      status,
      excludeId: selected?.id ?? null,
    });
    setSelected(picked);
    setPickCount((c) => c + 1);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-zinc-50">Chọn bài ngẫu nhiên</h1>
        <p className="mt-0.5 text-xs text-zinc-400">
          Tìm nhanh một bài hát để luyện tập hoặc giải trí ({candidates.length} bài phù hợp)
        </p>
      </header>

      {/* Filters */}
      <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Lọc theo Tone
          </label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`rounded-xl border py-2 text-xs font-medium transition-colors ${
                  tone === t
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Trạng thái
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`rounded-xl border py-2 text-xs font-medium transition-colors ${
                  status === st
                    ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                }`}
              >
                {STATUS_FILTER_LABELS[st]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pick Button */}
      <button
        type="button"
        disabled={isLoading || candidates.length === 0}
        onClick={handlePick}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-purple-500 py-4 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        <Shuffle className="h-5 w-5 stroke-[2.5]" />
        {selected ? 'Chọn lại bài khác' : 'Chọn bài hát ngẫu nhiên'}
      </button>

      {/* Result */}
      {candidates.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Music2 className="h-7 w-7" />}
          title="Không có bài hát phù hợp"
          description={
            songs.length === 0
              ? 'Thư viện của bạn đang trống. Hãy thêm bài hát mới trước nhé.'
              : 'Không có bài hát nào khớp với bộ lọc tone và trạng thái hiện tại.'
          }
          action={
            songs.length === 0 ? (
              <Link
                to="/songs/new"
                className="inline-block rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950"
              >
                Thêm bài hát
              </Link>
            ) : undefined
          }
        />
      ) : (
        selected && (
          <div
            key={`${selected.id}-${pickCount}`}
            className="animate-[fadeIn_0.25s_ease-out] rounded-3xl border border-purple-500/40 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                  Gợi ý cho bạn
                </span>
                <h2 className="mt-1 text-2xl font-bold text-zinc-50">{selected.name}</h2>
                <p className="mt-0.5 text-sm text-zinc-400">{selected.artist}</p>
              </div>
              {selected.score !== null && (
                <div className="flex items-center gap-1 rounded-xl bg-purple-500/15 px-3 py-1.5 text-sm font-bold text-purple-200">
                  <Star className="h-4 w-4 fill-purple-400 text-purple-400" />
                  {selected.score}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ToneBadge tone={selected.tone} />
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-300">
                {selected.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}
              </span>
            </div>

            {selected.note && (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <FileText className="h-3.5 w-3.5" />
                  Ghi chú
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{selected.note}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                to={`/songs/${selected.id}?from=random`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 active:scale-[0.98]"
              >
                Mở chi tiết
              </Link>

              {selected.youtubeUrl && (
                <a
                  href={selected.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 active:scale-[0.98]"
                >
                  <ExternalLink className="h-4 w-4" />
                  YouTube
                </a>
              )}

              <button
                type="button"
                onClick={handlePick}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 active:scale-[0.98]"
                aria-label="Chọn lại"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

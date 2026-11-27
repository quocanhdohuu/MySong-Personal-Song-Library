import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Music2,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { DEFAULT_FILTER_STATE, TONE_LABELS } from '../../constants/song';
import { useSongs } from '../../hooks/useSongs';
import { useToast } from '../../hooks/useToast';
import { filterAndSortSongs, toggleFavorite, toggleLearned } from '../../services/songService';
import type { SongFilterState, StatusFilter, Tone } from '../../types/song';
import { EmptyState } from '../../components/common/EmptyState';
import { SongListItem } from '../../components/song/SongListItem';
import { FilterSheet } from '../../components/song/FilterSheet';

interface LibraryPageProps {
  favoritesOnly?: boolean;
}

export function LibraryPage({ favoritesOnly = false }: LibraryPageProps) {
  const { songs, isLoading } = useSongs();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const initialTone = (searchParams.get('tone') as Tone | null) ?? 'ALL';
  const initialStatus = favoritesOnly
    ? 'FAVORITE'
    : ((searchParams.get('status') as StatusFilter | null) ?? 'ALL');

  const [filter, setFilter] = useState<SongFilterState>({
    ...DEFAULT_FILTER_STATE,
    tone: ['HIGH', 'MEDIUM', 'LOW'].includes(initialTone) ? initialTone : 'ALL',
    status: ['ALL', 'FAVORITE', 'LEARNED', 'UNLEARNED'].includes(initialStatus)
      ? initialStatus
      : 'ALL',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const effectiveFilter = useMemo<SongFilterState>(
    () => (favoritesOnly ? { ...filter, status: 'FAVORITE' } : filter),
    [filter, favoritesOnly]
  );

  const filteredSongs = useMemo(
    () => filterAndSortSongs(songs, effectiveFilter),
    [songs, effectiveFilter]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (effectiveFilter.tone !== 'ALL') count++;
    if (effectiveFilter.scorePreset !== 'ALL') count++;
    if (!favoritesOnly && effectiveFilter.status !== 'ALL') count++;
    if (effectiveFilter.sortBy !== 'NEWEST') count++;
    return count;
  }, [effectiveFilter, favoritesOnly]);

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await toggleFavorite(id);
      showToast(updated.isFavorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích', 'info');
    } catch {
      showToast('Không thể cập nhật yêu thích', 'error');
    }
  };

  const handleToggleLearned = async (id: string) => {
    try {
      const updated = await toggleLearned(id);
      showToast(updated.isLearned ? 'Đã đánh dấu đã thuộc' : 'Đã đánh dấu chưa thuộc', 'info');
    } catch {
      showToast('Không thể cập nhật trạng thái', 'error');
    }
  };

  const handleResetFilters = () => {
    setFilter({
      ...DEFAULT_FILTER_STATE,
      status: favoritesOnly ? 'FAVORITE' : 'ALL',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {favoritesOnly && (
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold text-zinc-50">
              {favoritesOnly ? 'Bài hát yêu thích' : 'Thư viện'}
            </h1>
            <p className="text-xs text-zinc-400">
              Hiển thị {filteredSongs.length} / {songs.length} bài hát
            </p>
          </div>
        </div>

        <Link
          to="/songs/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-emerald-500 px-3.5 text-sm font-semibold text-zinc-950 active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Thêm
        </Link>
      </header>

      {/* Search + Filter Trigger */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={filter.query}
            onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Tìm tên bài hát hoặc ca sĩ..."
            className="h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {filter.query && (
            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, query: '' }))}
              aria-label="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className={`relative flex h-11 items-center gap-1.5 rounded-2xl border px-3.5 text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300'
          }`}
          aria-label="Mở bộ lọc"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Lọc</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-zinc-950">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Tone Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter((prev) => ({ ...prev, tone: t }))}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter.tone === t
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
          >
            {t === 'ALL' ? 'Tất cả tone' : `Tone ${TONE_LABELS[t]}`}
          </button>
        ))}

        {(activeFilterCount > 0 || filter.query !== '') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
          >
            <RotateCcw className="h-3 w-3" />
            Đặt lại
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl bg-zinc-900" />
          ))}
        </div>
      ) : filteredSongs.length === 0 ? (
        songs.length === 0 ? (
          <EmptyState
            icon={<Music2 className="h-7 w-7" />}
            title="Chưa có bài hát nào"
            description="Thêm bài hát bạn thích hoặc muốn luyện tập vào thư viện."
            action={
              <Link
                to="/songs/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950"
              >
                <Plus className="h-4 w-4" />
                Thêm bài hát
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={favoritesOnly ? <Heart className="h-7 w-7" /> : <Search className="h-7 w-7" />}
            title={
              favoritesOnly && songs.every((s) => !s.isFavorite)
                ? 'Chưa có bài hát yêu thích'
                : 'Không tìm thấy bài hát phù hợp'
            }
            description={
              favoritesOnly && songs.every((s) => !s.isFavorite)
                ? 'Nhấn biểu tượng trái tim trên bài hát để thêm vào danh sách yêu thích.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc.'
            }
            action={
              (activeFilterCount > 0 || filter.query !== '') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Đặt lại bộ lọc
                </button>
              )
            }
          />
        )
      ) : (
        <div className="space-y-2.5">
          {filteredSongs.map((song) => (
            <SongListItem
              key={song.id}
              song={song}
              onToggleFavorite={handleToggleFavorite}
              onToggleLearned={handleToggleLearned}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        to="/songs/new"
        aria-label="Thêm bài hát mới"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-xl shadow-emerald-500/30 transition-transform active:scale-90 sm:right-[max(1rem,calc(50%-15rem))]"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </Link>

      <FilterSheet
        open={isFilterOpen}
        filter={effectiveFilter}
        hideStatusFilter={favoritesOnly}
        onChange={setFilter}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

import { RotateCcw, X } from 'lucide-react';
import {
  DEFAULT_FILTER_STATE,
  SORT_OPTION_LABELS,
  STATUS_FILTER_LABELS,
  TONE_LABELS,
} from '../../constants/song';
import type {
  ScoreRangePreset,
  SongFilterState,
  SortOption,
  StatusFilter,
  Tone,
} from '../../types/song';

interface FilterSheetProps {
  open: boolean;
  filter: SongFilterState;
  hideStatusFilter?: boolean;
  onChange: (next: SongFilterState) => void;
  onClose: () => void;
}

const SCORE_PRESETS: { value: ScoreRangePreset; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: '0-5', label: '0 – 5' },
  { value: '5-7', label: '5 – 7' },
  { value: '7-9', label: '7 – 9' },
  { value: '9-10', label: '9 – 10' },
  { value: 'CUSTOM', label: 'Tùy chỉnh' },
];

export function FilterSheet({
  open,
  filter,
  hideStatusFilter = false,
  onChange,
  onClose,
}: FilterSheetProps) {
  if (!open) return null;

  const handleReset = () => {
    onChange({
      ...DEFAULT_FILTER_STATE,
      query: filter.query,
      status: hideStatusFilter ? filter.status : 'ALL',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-800 bg-zinc-900 p-5 pb-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Bộ lọc & Sắp xếp</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Đặt lại
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {/* Tone */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tone bài hát
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...filter, tone: t as Tone | 'ALL' })}
                  className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                    filter.tone === t
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  {t === 'ALL' ? 'Tất cả' : TONE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Điểm đánh giá
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SCORE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filter,
                      scorePreset: preset.value,
                    })
                  }
                  className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                    filter.scorePreset === preset.value
                      ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {filter.scorePreset === 'CUSTOM' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Từ điểm</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step="0.5"
                    placeholder="0"
                    value={filter.minScore ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange({
                        ...filter,
                        minScore: val === '' ? null : Number(val),
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Đến điểm</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step="0.5"
                    placeholder="10"
                    value={filter.maxScore ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChange({
                        ...filter,
                        maxScore: val === '' ? null : Number(val),
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {!hideStatusFilter && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Trạng thái
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onChange({ ...filter, status: st })}
                    className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                      filter.status === st
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    {STATUS_FILTER_LABELS[st]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Sắp xếp theo
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(SORT_OPTION_LABELS) as SortOption[]).map((sortKey) => (
                <button
                  key={sortKey}
                  type="button"
                  onClick={() => onChange({ ...filter, sortBy: sortKey })}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    filter.sortBy === sortKey
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300'
                  }`}
                >
                  {SORT_OPTION_LABELS[sortKey]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 active:scale-[0.98]"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

import type { SongFilterState, SortOption, StatusFilter, Tone } from '../types/song';

export const APP_VERSION = '1.0.0';

export const TONE_LABELS: Record<Tone, string> = {
  HIGH: 'Cao',
  MEDIUM: 'Vừa',
  LOW: 'Thấp',
};

export const TONE_COLORS: Record<Tone, string> = {
  HIGH: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: 'Tất cả bài hát',
  FAVORITE: 'Yêu thích',
  LEARNED: 'Đã thuộc',
  UNLEARNED: 'Chưa thuộc',
};

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  NEWEST: 'Mới thêm gần đây',
  OLDEST: 'Cũ nhất',
  SCORE_DESC: 'Điểm cao đến thấp',
  SCORE_ASC: 'Điểm thấp đến cao',
  NAME_ASC: 'Tên bài hát A–Z',
  ARTIST_ASC: 'Tên ca sĩ A–Z',
};

export const DEFAULT_FILTER_STATE: SongFilterState = {
  query: '',
  tone: 'ALL',
  scorePreset: 'ALL',
  minScore: null,
  maxScore: null,
  status: 'ALL',
  sortBy: 'NEWEST',
};

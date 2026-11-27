export type Tone = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Song {
  id: string;
  name: string;
  artist: string;
  score: number | null;
  tone: Tone;
  note: string;
  youtubeUrl: string;
  isFavorite: boolean;
  isLearned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SongInput = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;

export type ScoreRangePreset = 'ALL' | '0-5' | '5-7' | '7-9' | '9-10' | 'CUSTOM';

export type StatusFilter = 'ALL' | 'FAVORITE' | 'LEARNED' | 'UNLEARNED';

export type SortOption =
  | 'NEWEST'
  | 'OLDEST'
  | 'SCORE_DESC'
  | 'SCORE_ASC'
  | 'NAME_ASC'
  | 'ARTIST_ASC';

export interface SongFilterState {
  query: string;
  tone: Tone | 'ALL';
  scorePreset: ScoreRangePreset;
  minScore: number | null;
  maxScore: number | null;
  status: StatusFilter;
  sortBy: SortOption;
}

import type { Song, StatusFilter, Tone } from '../types/song';

export interface RandomPickOptions {
  tone: Tone | 'ALL';
  status: StatusFilter;
  excludeId?: string | null;
}

export function getRandomCandidates(songs: Song[], options: RandomPickOptions): Song[] {
  return songs.filter((song) => {
    if (options.tone !== 'ALL' && song.tone !== options.tone) return false;
    if (options.status === 'FAVORITE' && !song.isFavorite) return false;
    if (options.status === 'LEARNED' && !song.isLearned) return false;
    if (options.status === 'UNLEARNED' && song.isLearned) return false;
    return true;
  });
}

export function pickRandomSong(songs: Song[], options: RandomPickOptions): Song | null {
  const candidates = getRandomCandidates(songs, options);
  if (candidates.length === 0) return null;

  const pool =
    candidates.length > 1 && options.excludeId
      ? candidates.filter((s) => s.id !== options.excludeId)
      : candidates;

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}

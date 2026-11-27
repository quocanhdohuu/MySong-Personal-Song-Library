import { db } from './database/db';
import type { ScoreRangePreset, Song, SongFilterState, SongInput } from '../types/song';
import { normalizeVietnamese } from '../utils/normalizeVietnamese';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getAllSongs(): Promise<Song[]> {
  return db.songs.toArray();
}

export async function getSongById(id: string): Promise<Song | undefined> {
  return db.songs.get(id);
}

export async function createSong(input: SongInput): Promise<Song> {
  const now = new Date().toISOString();
  const song: Song = {
    id: generateId(),
    name: input.name.trim(),
    artist: input.artist.trim(),
    score: input.score,
    tone: input.tone,
    note: input.note.trim(),
    youtubeUrl: input.youtubeUrl.trim(),
    isFavorite: input.isFavorite,
    isLearned: input.isLearned,
    createdAt: now,
    updatedAt: now,
  };
  await db.songs.add(song);
  return song;
}

export async function updateSong(id: string, updates: Partial<SongInput>): Promise<Song> {
  const existing = await db.songs.get(id);
  if (!existing) {
    throw new Error('Không tìm thấy bài hát');
  }
  const updated: Song = {
    ...existing,
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : existing.name,
    artist: updates.artist !== undefined ? updates.artist.trim() : existing.artist,
    note: updates.note !== undefined ? updates.note.trim() : existing.note,
    youtubeUrl: updates.youtubeUrl !== undefined ? updates.youtubeUrl.trim() : existing.youtubeUrl,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await db.songs.put(updated);
  return updated;
}

export async function deleteSong(id: string): Promise<void> {
  await db.songs.delete(id);
}

export async function toggleFavorite(id: string): Promise<Song> {
  const existing = await db.songs.get(id);
  if (!existing) {
    throw new Error('Không tìm thấy bài hát');
  }
  return updateSong(id, { isFavorite: !existing.isFavorite });
}

export async function toggleLearned(id: string): Promise<Song> {
  const existing = await db.songs.get(id);
  if (!existing) {
    throw new Error('Không tìm thấy bài hát');
  }
  return updateSong(id, { isLearned: !existing.isLearned });
}

function getScoreBounds(
  preset: ScoreRangePreset,
  minScore: number | null,
  maxScore: number | null
): { min: number | null; max: number | null } {
  switch (preset) {
    case '0-5':
      return { min: 0, max: 5 };
    case '5-7':
      return { min: 5, max: 7 };
    case '7-9':
      return { min: 7, max: 9 };
    case '9-10':
      return { min: 9, max: 10 };
    case 'CUSTOM':
      return { min: minScore, max: maxScore };
    case 'ALL':
    default:
      return { min: null, max: null };
  }
}

export function filterAndSortSongs(songs: Song[], filter: SongFilterState): Song[] {
  const normalizedQuery = normalizeVietnamese(filter.query);
  const { min, max } = getScoreBounds(filter.scorePreset, filter.minScore, filter.maxScore);
  const hasScoreFilter = min !== null || max !== null;

  const filtered = songs.filter((song) => {
    if (normalizedQuery) {
      const matchName = normalizeVietnamese(song.name).includes(normalizedQuery);
      const matchArtist = normalizeVietnamese(song.artist).includes(normalizedQuery);
      if (!matchName && !matchArtist) return false;
    }

    if (filter.tone !== 'ALL' && song.tone !== filter.tone) {
      return false;
    }

    if (filter.status === 'FAVORITE' && !song.isFavorite) return false;
    if (filter.status === 'LEARNED' && !song.isLearned) return false;
    if (filter.status === 'UNLEARNED' && song.isLearned) return false;

    if (hasScoreFilter) {
      if (song.score === null) return false;
      if (min !== null && song.score < min) return false;
      if (max !== null && song.score > max) return false;
    }

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filter.sortBy) {
      case 'OLDEST':
        return a.createdAt.localeCompare(b.createdAt);
      case 'SCORE_DESC': {
        if (a.score === null && b.score === null) return b.createdAt.localeCompare(a.createdAt);
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
      }
      case 'SCORE_ASC': {
        if (a.score === null && b.score === null) return b.createdAt.localeCompare(a.createdAt);
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return a.score - b.score;
      }
      case 'NAME_ASC':
        return a.name.localeCompare(b.name, 'vi');
      case 'ARTIST_ASC':
        return a.artist.localeCompare(b.artist, 'vi');
      case 'NEWEST':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return sorted;
}

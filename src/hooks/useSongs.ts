import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database/db';
import type { Song } from '../types/song';

export function useSongs(): { songs: Song[]; isLoading: boolean } {
  const result = useLiveQuery(() => db.songs.toArray(), []);
  return {
    songs: result ?? [],
    isLoading: result === undefined,
  };
}

export function useSong(id: string | undefined): { song: Song | undefined; isLoading: boolean } {
  const result = useLiveQuery(
    async () => (id ? db.songs.get(id) : undefined),
    [id]
  );
  return {
    song: result,
    isLoading: id !== undefined && result === undefined,
  };
}

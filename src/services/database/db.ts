import Dexie, { type EntityTable } from 'dexie';
import type { Song } from '../../types/song';

export class MySongDatabase extends Dexie {
  songs!: EntityTable<Song, 'id'>;

  constructor() {
    super('MySongDB');
    this.version(1).stores({
      songs: 'id, name, artist, tone, score, isFavorite, isLearned, createdAt',
    });
  }
}

export const db = new MySongDatabase();

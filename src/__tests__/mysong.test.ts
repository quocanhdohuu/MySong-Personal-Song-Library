import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_FILTER_STATE } from '../constants/song';
import { db } from '../services/database/db';
import {
  createSong,
  deleteSong,
  filterAndSortSongs,
  getAllSongs,
  getSongById,
  toggleFavorite,
  toggleLearned,
  updateSong,
} from '../services/songService';
import { pickRandomSong } from '../services/randomService';
import { generateCsvContent } from '../services/backupService';
import { importExcelSongs, parseExcelBuffer } from '../services/excelImportService';
import * as XLSX from 'xlsx';
import { normalizeVietnamese } from '../utils/normalizeVietnamese';
import { songFormSchema } from '../utils/validators';

describe('MySong Core Functionality', () => {
  beforeEach(async () => {
    await db.songs.clear();
  });

  describe('Validation (songFormSchema)', () => {
    it('accepts valid song input including empty optional fields', () => {
      const res = songFormSchema.safeParse({
        name: 'Nơi này có anh',
        artist: 'Sơn Tùng M-TP',
        score: '',
        tone: 'HIGH',
        youtubeUrl: '',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      expect(res.success).toBe(true);
    });

    it('rejects missing name or artist', () => {
      const noName = songFormSchema.safeParse({
        name: '   ',
        artist: 'Ca sĩ A',
        score: '8',
        tone: 'MEDIUM',
        youtubeUrl: '',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      const noArtist = songFormSchema.safeParse({
        name: 'Bài hát A',
        artist: '',
        score: '8',
        tone: 'MEDIUM',
        youtubeUrl: '',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      expect(noName.success).toBe(false);
      expect(noArtist.success).toBe(false);
    });

    it('rejects negative, >10, or non-numeric scores and invalid URLs', () => {
      const neg = songFormSchema.safeParse({
        name: 'A',
        artist: 'B',
        score: '-1',
        tone: 'LOW',
        youtubeUrl: '',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      const over10 = songFormSchema.safeParse({
        name: 'A',
        artist: 'B',
        score: '10.5',
        tone: 'LOW',
        youtubeUrl: '',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      const badUrl = songFormSchema.safeParse({
        name: 'A',
        artist: 'B',
        score: '8.5',
        tone: 'LOW',
        youtubeUrl: 'not-a-url',
        note: '',
        isFavorite: false,
        isLearned: false,
      });
      expect(neg.success).toBe(false);
      expect(over10.success).toBe(false);
      expect(badUrl.success).toBe(false);
    });
  });

  describe('Song CRUD & Toggles (IndexedDB)', () => {
    it('creates, updates (preserving id & createdAt), toggles, and deletes a song', async () => {
      const created = await createSong({
        name: 'Cắt đôi nỗi sầu',
        artist: 'Tăng Duy Tân',
        score: 8.5,
        tone: 'MEDIUM',
        note: 'Điệp khúc dễ hát',
        youtubeUrl: 'https://youtu.be/abc123',
        isFavorite: false,
        isLearned: false,
      });

      expect(created.id).toBeTruthy();
      expect(created.isFavorite).toBe(false);

      const updated = await updateSong(created.id, {
        score: 9,
        note: 'Đã thuộc lời',
      });
      expect(updated.id).toBe(created.id);
      expect(updated.createdAt).toBe(created.createdAt);
      expect(updated.score).toBe(9);
      expect(updated.name).toBe('Cắt đôi nỗi sầu');

      const fav = await toggleFavorite(created.id);
      expect(fav.isFavorite).toBe(true);

      const learned = await toggleLearned(created.id);
      expect(learned.isLearned).toBe(true);

      await deleteSong(created.id);
      const afterDelete = await getSongById(created.id);
      expect(afterDelete).toBeUndefined();
    });
  });

  describe('Vietnamese Search, Filter & Sort', () => {
    it('normalizes Vietnamese accents including đ/Đ', () => {
      expect(normalizeVietnamese('Sơn Tùng M-TP')).toBe('son tung m-tp');
      expect(normalizeVietnamese('Đen Vâu')).toBe('den vau');
    });

    it('filters by unaccented query, tone, score range, status and sorts', async () => {
      const s1 = await createSong({
        name: 'Hãy trao cho anh',
        artist: 'Sơn Tùng M-TP',
        score: 8.5,
        tone: 'LOW',
        note: '',
        youtubeUrl: '',
        isFavorite: true,
        isLearned: true,
      });
      const s2 = await createSong({
        name: 'Chúng ta của hiện tại',
        artist: 'Sơn Tùng M-TP',
        score: 6.5,
        tone: 'HIGH',
        note: '',
        youtubeUrl: '',
        isFavorite: false,
        isLearned: false,
      });
      const s3 = await createSong({
        name: 'Mang tiền về cho mẹ',
        artist: 'Đen Vâu',
        score: 9.5,
        tone: 'LOW',
        note: '',
        youtubeUrl: '',
        isFavorite: true,
        isLearned: false,
      });

      const all = await getAllSongs();

      // Search "son tung"
      const searchRes = filterAndSortSongs(all, {
        ...DEFAULT_FILTER_STATE,
        query: 'son tung',
      });
      expect(searchRes.map((s) => s.id)).toContain(s1.id);
      expect(searchRes.map((s) => s.id)).toContain(s2.id);
      expect(searchRes.map((s) => s.id)).not.toContain(s3.id);

      // Combined filter: Tone LOW + Score >= 8 + Favorite
      const combined = filterAndSortSongs(all, {
        ...DEFAULT_FILTER_STATE,
        tone: 'LOW',
        scorePreset: 'CUSTOM',
        minScore: 8,
        maxScore: 10,
        status: 'FAVORITE',
        sortBy: 'SCORE_DESC',
      });
      expect(combined.map((s) => s.id)).toEqual([s3.id, s1.id]);
    });
  });

  describe('Random Song Selection', () => {
    it('filters candidates and avoids repeating excludeId when alternatives exist', async () => {
      const s1 = await createSong({
        name: 'Bài 1',
        artist: 'Ca sĩ 1',
        score: 8,
        tone: 'LOW',
        note: '',
        youtubeUrl: '',
        isFavorite: true,
        isLearned: true,
      });
      const s2 = await createSong({
        name: 'Bài 2',
        artist: 'Ca sĩ 2',
        score: 7,
        tone: 'LOW',
        note: '',
        youtubeUrl: '',
        isFavorite: true,
        isLearned: false,
      });

      const all = await getAllSongs();
      const picked = pickRandomSong(all, {
        tone: 'LOW',
        status: 'FAVORITE',
        excludeId: s1.id,
      });
      expect(picked?.id).toBe(s2.id);

      const none = pickRandomSong(all, {
        tone: 'HIGH',
        status: 'ALL',
      });
      expect(none).toBeNull();
    });
  });

  describe('CSV Export', () => {
    it('generates CSV with UTF-8 BOM and Vietnamese headers', async () => {
      await createSong({
        name: 'New Backup Song',
        artist: 'Artist 1',
        score: 7,
        tone: 'MEDIUM',
        note: 'Original note',
        youtubeUrl: '',
        isFavorite: false,
        isLearned: false,
      });

      const all = await getAllSongs();
      const csv = generateCsvContent(all);
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Tên bài hát');
      expect(csv).toContain('New Backup Song');
    });
  });

  describe('Excel Import', () => {
    it('parses valid Excel rows, detects duplicates and row errors, and imports to IndexedDB', async () => {
      const existing = await createSong({
        name: 'Nơi này có anh',
        artist: 'Sơn Tùng M-TP',
        score: 8,
        tone: 'HIGH',
        note: '',
        youtubeUrl: '',
        isFavorite: false,
        isLearned: false,
      });

      const rows = [
        {
          'Tên bài hát': 'Nơi này có anh',
          'Tên ca sĩ': 'Sơn Tùng M-TP',
          Điểm: '9',
          Tone: 'Cao',
          'Yêu thích': 'Có',
          'Đã thuộc': 'Đã thuộc',
          'Ghi chú': 'Trùng bài cũ',
          'Link YouTube': '',
        },
        {
          'Tên bài hát': 'Cắt đôi nỗi sầu',
          'Tên ca sĩ': 'Tăng Duy Tân',
          Điểm: '8.5',
          Tone: 'Vừa',
          'Yêu thích': 'Không',
          'Đã thuộc': 'Có',
          'Ghi chú': 'Bài mới',
          'Link YouTube': 'https://youtu.be/test123',
        },
        {
          'Tên bài hát': '',
          'Tên ca sĩ': 'Thiếu tên bài',
          Điểm: '7',
          Tone: 'Thấp',
        },
      ];

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const u8 = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

      const preview = parseExcelBuffer(u8, [existing]);
      expect(preview.validSongs).toHaveLength(2);
      expect(preview.newSongs).toHaveLength(1);
      expect(preview.duplicateCount).toBe(1);
      expect(preview.errors).toHaveLength(1);
      expect(preview.newSongs[0].tone).toBe('MEDIUM');
      expect(preview.newSongs[0].score).toBe(8.5);
      expect(preview.newSongs[0].isLearned).toBe(true);

      const importedCount = await importExcelSongs(preview.newSongs);
      expect(importedCount).toBe(1);

      const all = await getAllSongs();
      expect(all).toHaveLength(2);
    });
  });
});

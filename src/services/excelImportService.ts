import * as XLSX from 'xlsx';
import type { Song, SongInput, Tone } from '../types/song';
import { normalizeVietnamese } from '../utils/normalizeVietnamese';
import { isValidHttpUrl } from '../utils/validators';
import { db } from './database/db';

export interface ExcelImportRowError {
  rowNumber: number;
  reason: string;
}

export interface ExcelImportPreview {
  validSongs: SongInput[];
  newSongs: SongInput[];
  duplicateCount: number;
  errors: ExcelImportRowError[];
}

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

function getSongKey(name: string, artist: string): string {
  return `${normalizeVietnamese(name)}::${normalizeVietnamese(artist)}`;
}

function findColumnValue(row: Record<string, unknown>, aliases: string[]): string {
  for (const [rawKey, rawVal] of Object.entries(row)) {
    const normalizedKey = normalizeVietnamese(rawKey);
    if (aliases.includes(normalizedKey)) {
      return String(rawVal ?? '').trim();
    }
  }
  return '';
}

function parseTone(raw: string): Tone | null {
  if (!raw) return 'MEDIUM';
  const norm = normalizeVietnamese(raw);
  if (norm === 'cao' || norm === 'high') return 'HIGH';
  if (norm === 'vua' || norm === 'trung binh' || norm === 'medium') return 'MEDIUM';
  if (norm === 'thap' || norm === 'low') return 'LOW';
  return null;
}

function parseBoolean(raw: string): boolean {
  const norm = normalizeVietnamese(raw);
  return (
    norm === 'co' ||
    norm === 'yes' ||
    norm === 'true' ||
    norm === '1' ||
    norm === 'x' ||
    norm === 'da thuoc'
  );
}

const NAME_ALIASES = ['ten bai hat', 'bai hat', 'ten', 'name', 'song', 'title'];
const ARTIST_ALIASES = ['ten ca si', 'ca si', 'artist', 'singer'];
const SCORE_ALIASES = ['diem', 'diem danh gia', 'score', 'rating'];
const TONE_ALIASES = ['tone', 'tong'];
const FAVORITE_ALIASES = ['yeu thich', 'favorite', 'fav'];
const LEARNED_ALIASES = ['da thuoc', 'thuoc', 'learned'];
const NOTE_ALIASES = ['ghi chu', 'note', 'notes'];
const YOUTUBE_ALIASES = ['link youtube', 'youtube', 'link', 'url', 'youtubeurl'];

export function parseExcelBuffer(
  buffer: ArrayBuffer,
  existingSongs: Song[]
): ExcelImportPreview {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { validSongs: [], newSongs: [], duplicateCount: 0, errors: [] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const existingKeys = new Set(existingSongs.map((s) => getSongKey(s.name, s.artist)));
  const validSongs: SongInput[] = [];
  const newSongs: SongInput[] = [];
  const errors: ExcelImportRowError[] = [];
  let duplicateCount = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 header, +1 1-indexed
    const name = findColumnValue(row, NAME_ALIASES);
    const artist = findColumnValue(row, ARTIST_ALIASES);

    if (!name && !artist) {
      return; // Skip completely blank rows
    }
    if (!name) {
      errors.push({ rowNumber, reason: 'Thiếu tên bài hát' });
      return;
    }
    if (!artist) {
      errors.push({ rowNumber, reason: 'Thiếu tên ca sĩ' });
      return;
    }

    const rawScore = findColumnValue(row, SCORE_ALIASES);
    let score: number | null = null;
    if (rawScore !== '') {
      const parsed = Number(rawScore.replace(',', '.'));
      if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
        errors.push({ rowNumber, reason: `Điểm không hợp lệ ("${rawScore}")` });
        return;
      }
      score = parsed;
    }

    const rawTone = findColumnValue(row, TONE_ALIASES);
    const tone = parseTone(rawTone);
    if (!tone) {
      errors.push({ rowNumber, reason: `Tone không hợp lệ ("${rawTone}")` });
      return;
    }

    const youtubeUrl = findColumnValue(row, YOUTUBE_ALIASES);
    if (youtubeUrl && !isValidHttpUrl(youtubeUrl)) {
      errors.push({ rowNumber, reason: 'Link YouTube không hợp lệ' });
      return;
    }

    const note = findColumnValue(row, NOTE_ALIASES);
    const isFavorite = parseBoolean(findColumnValue(row, FAVORITE_ALIASES));
    const isLearned = parseBoolean(findColumnValue(row, LEARNED_ALIASES));

    const songInput: SongInput = {
      name,
      artist,
      score,
      tone,
      note,
      youtubeUrl,
      isFavorite,
      isLearned,
    };

    validSongs.push(songInput);
    if (existingKeys.has(getSongKey(name, artist))) {
      duplicateCount++;
    } else {
      newSongs.push(songInput);
    }
  });

  return { validSongs, newSongs, duplicateCount, errors };
}

export async function importExcelSongs(songsToImport: SongInput[]): Promise<number> {
  if (songsToImport.length === 0) return 0;

  const now = new Date().toISOString();
  const records: Song[] = songsToImport.map((item) => ({
    id: generateId(),
    name: item.name.trim(),
    artist: item.artist.trim(),
    score: item.score,
    tone: item.tone,
    note: item.note.trim(),
    youtubeUrl: item.youtubeUrl.trim(),
    isFavorite: item.isFavorite,
    isLearned: item.isLearned,
    createdAt: now,
    updatedAt: now,
  }));

  await db.songs.bulkAdd(records);
  return records.length;
}

export function downloadSampleExcel(): string {
  const sampleRows = [
    {
      'Tên bài hát': 'Nơi này có anh',
      'Tên ca sĩ': 'Sơn Tùng M-TP',
      Điểm: 8.5,
      Tone: 'Cao',
      'Yêu thích': 'Có',
      'Đã thuộc': 'Đã thuộc',
      'Ghi chú': 'Điệp khúc hơi cao',
      'Link YouTube': 'https://www.youtube.com/watch?v=FN7ALfpGxiI',
    },
    {
      'Tên bài hát': 'Cắt đôi nỗi sầu',
      'Tên ca sĩ': 'Tăng Duy Tân',
      Điểm: 9,
      Tone: 'Vừa',
      'Yêu thích': 'Không',
      'Đã thuộc': 'Chưa thuộc',
      'Ghi chú': 'Dễ hát karaoke',
      'Link YouTube': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MySong');
  const filename = 'mysong-mau-import.xlsx';
  XLSX.writeFile(workbook, filename);
  return filename;
}

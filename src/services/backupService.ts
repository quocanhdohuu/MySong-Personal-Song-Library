import { TONE_LABELS } from '../constants/song';
import type { Song } from '../types/song';

function getDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsvContent(songs: Song[]): string {
  const headers = [
    'ID',
    'Tên bài hát',
    'Tên ca sĩ',
    'Điểm',
    'Tone',
    'Yêu thích',
    'Đã thuộc',
    'Ghi chú',
    'Link YouTube',
    'Ngày tạo',
    'Ngày cập nhật',
  ];

  const rows = songs.map((s) =>
    [
      s.id,
      s.name,
      s.artist,
      s.score !== null ? String(s.score) : '',
      TONE_LABELS[s.tone],
      s.isFavorite ? 'Có' : 'Không',
      s.isLearned ? 'Đã thuộc' : 'Chưa thuộc',
      s.note,
      s.youtubeUrl,
      s.createdAt,
      s.updatedAt,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

export function exportSongsCsv(songs: Song[]): string {
  const filename = `mysong-export-${getDateStamp()}.csv`;
  const csv = generateCsvContent(songs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
  return filename;
}

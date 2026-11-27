import { z } from 'zod';

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const songFormSchema = z.object({
  name: z.string().trim().min(1, 'Tên bài hát không được để trống'),
  artist: z.string().trim().min(1, 'Tên ca sĩ không được để trống'),
  score: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (val === '') return true;
        const num = Number(val);
        return !Number.isNaN(num) && Number.isFinite(num) && num >= 0 && num <= 10;
      },
      { message: 'Điểm đánh giá phải từ 0 đến 10' }
    ),
  tone: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    required_error: 'Vui lòng chọn tone bài hát',
  }),
  youtubeUrl: z
    .string()
    .trim()
    .refine(isValidHttpUrl, { message: 'Link YouTube phải là URL hợp lệ (http/https)' }),
  note: z.string(),
  isFavorite: z.boolean(),
  isLearned: z.boolean(),
});

export type SongFormValues = z.infer<typeof songFormSchema>;

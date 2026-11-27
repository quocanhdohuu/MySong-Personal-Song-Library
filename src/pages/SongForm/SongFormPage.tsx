import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Heart, Save, Trash2 } from 'lucide-react';
import { TONE_LABELS } from '../../constants/song';
import { useSong } from '../../hooks/useSongs';
import { useToast } from '../../hooks/useToast';
import { createSong, deleteSong, updateSong } from '../../services/songService';
import type { Tone } from '../../types/song';
import { songFormSchema, type SongFormValues } from '../../utils/validators';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function SongFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { song, isLoading } = useSong(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      name: '',
      artist: '',
      score: '',
      tone: 'MEDIUM',
      youtubeUrl: '',
      note: '',
      isFavorite: false,
      isLearned: false,
    },
  });

  useEffect(() => {
    if (isEditMode && song) {
      reset({
        name: song.name,
        artist: song.artist,
        score: song.score !== null ? String(song.score) : '',
        tone: song.tone,
        youtubeUrl: song.youtubeUrl,
        note: song.note,
        isFavorite: song.isFavorite,
        isLearned: song.isLearned,
      });
    }
  }, [isEditMode, song, reset]);

  const currentTone = watch('tone');
  const isFavorite = watch('isFavorite');
  const isLearned = watch('isLearned');

  const onSubmit = async (values: SongFormValues) => {
    const parsedScore = values.score.trim() === '' ? null : Number(values.score.trim());
    const payload = {
      name: values.name.trim(),
      artist: values.artist.trim(),
      score: parsedScore,
      tone: values.tone,
      youtubeUrl: values.youtubeUrl.trim(),
      note: values.note.trim(),
      isFavorite: values.isFavorite,
      isLearned: values.isLearned,
    };

    try {
      if (isEditMode && id) {
        await updateSong(id, payload);
        showToast('Đã cập nhật bài hát', 'success');
        navigate(`/songs/${id}`, { replace: true });
      } else {
        const created = await createSong(payload);
        showToast('Đã thêm bài hát mới', 'success');
        navigate(`/songs/${created.id}`, { replace: true });
      }
    } catch {
      showToast('Lưu bài hát thất bại', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSong(id);
      showToast('Đã xóa bài hát', 'info');
      navigate('/library', { replace: true });
    } catch {
      showToast('Không thể xóa bài hát', 'error');
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-900" />
        <div className="h-96 animate-pulse rounded-3xl bg-zinc-900" />
      </div>
    );
  }

  if (isEditMode && !isLoading && !song) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-400">Không tìm thấy bài hát này.</p>
        <button
          type="button"
          onClick={() => navigate('/library')}
          className="mt-4 rounded-2xl bg-zinc-800 px-4 py-2 text-sm text-zinc-200"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 active:scale-95"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-zinc-50">
            {isEditMode ? 'Chỉnh sửa bài hát' : 'Thêm bài hát mới'}
          </h1>
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 active:scale-95"
            aria-label="Xóa bài hát"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tên bài hát */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Tên bài hát <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Nơi này có anh"
            {...register('name')}
            className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>

        {/* Tên ca sĩ */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Tên ca sĩ <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Sơn Tùng M-TP"
            {...register('artist')}
            className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {errors.artist && (
            <p className="mt-1 text-xs text-rose-400">{errors.artist.message}</p>
          )}
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Tone <span className="text-rose-400">*</span>
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-2.5">
            {(['HIGH', 'MEDIUM', 'LOW'] as Tone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setValue('tone', t, { shouldValidate: true })}
                className={`h-11 rounded-2xl border text-sm font-medium transition-colors ${
                  currentTone === t
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                }`}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
          {errors.tone && (
            <p className="mt-1 text-xs text-rose-400">{errors.tone.message}</p>
          )}
        </div>

        {/* Điểm đánh giá */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Điểm đánh giá (0 – 10)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            max="10"
            placeholder="Bỏ trống nếu chưa đánh giá"
            {...register('score')}
            className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          {errors.score && (
            <p className="mt-1 text-xs text-rose-400">{errors.score.message}</p>
          )}
        </div>

        {/* Link YouTube */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Link YouTube / Karaoke
          </label>
          <input
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=..."
            {...register('youtubeUrl')}
            className="mt-1.5 h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          {errors.youtubeUrl && (
            <p className="mt-1 text-xs text-rose-400">{errors.youtubeUrl.message}</p>
          )}
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Ghi chú luyện tập
          </label>
          <textarea
            rows={3}
            placeholder="Ví dụ: Điệp khúc cao, cần hạ 1 tone khi hát karaoke..."
            {...register('note')}
            className="mt-1.5 w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setValue('isFavorite', !isFavorite)}
            className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors ${
              isFavorite
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
            Yêu thích
          </button>

          <button
            type="button"
            onClick={() => setValue('isLearned', !isLearned)}
            className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors ${
              isLearned
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Đã thuộc
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 py-3.5 text-sm font-medium text-zinc-300 active:scale-[0.98]"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Lưu bài hát
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa bài hát?"
        description={`Bạn có chắc chắn muốn xóa "${song?.name}" khỏi thư viện? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

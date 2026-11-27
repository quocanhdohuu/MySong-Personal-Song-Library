import { useEffect, useState } from 'react';
import { FileSpreadsheet, HardDrive, Info } from 'lucide-react';
import { APP_VERSION } from '../../constants/song';
import { useSongs } from '../../hooks/useSongs';
import { useToast } from '../../hooks/useToast';
import { exportSongsCsv } from '../../services/backupService';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function SettingsPage() {
  const { songs } = useSongs();
  const { showToast } = useToast();
  const [storageInfo, setStorageInfo] = useState<{ usage?: number; quota?: number } | null>(null);

  useEffect(() => {
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      navigator.storage
        .estimate()
        .then((est) => setStorageInfo({ usage: est.usage, quota: est.quota }))
        .catch(() => setStorageInfo(null));
    }
  }, [songs.length]);

  const handleExportCsv = () => {
    const filename = exportSongsCsv(songs);
    showToast(`Đã xuất file ${filename}`, 'success');
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-zinc-50">Cài đặt & Dữ liệu</h1>
        <p className="mt-0.5 text-xs text-zinc-400">
          Xuất danh sách, hướng dẫn cài đặt và thông tin ứng dụng MySong
        </p>
      </header>

      {/* Export CSV */}
      <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex w-full items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-800/70 px-4 py-3 text-left text-sm font-medium text-zinc-200 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Xuất danh sách CSV
          </span>
          <span className="text-xs text-zinc-400">{songs.length} bài</span>
        </button>
      </section>


      {/* Storage & App Info */}
      <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Info className="h-4 w-4 text-zinc-400" />
          Thông tin ứng dụng
        </div>

        <div className="space-y-2 text-zinc-400">
          <div className="flex items-center justify-between">
            <span>Tên ứng dụng</span>
            <span className="font-medium text-zinc-200">MySong – Personal Song Library</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Phiên bản</span>
            <span className="font-medium text-zinc-200">{APP_VERSION}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Số lượng bài hát</span>
            <span className="font-medium text-zinc-200">{songs.length} bài</span>
          </div>
          {storageInfo?.usage !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5" />
                Dung lượng đã dùng
              </span>
              <span className="font-medium text-zinc-200">
                {formatBytes(storageInfo.usage)}
                {storageInfo.quota ? ` / ${formatBytes(storageInfo.quota)}` : ''}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

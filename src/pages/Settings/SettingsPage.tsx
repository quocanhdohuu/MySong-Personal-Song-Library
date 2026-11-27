import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  HardDrive,
  Info,
  Upload,
} from 'lucide-react';
import { APP_VERSION } from '../../constants/song';
import { useSongs } from '../../hooks/useSongs';
import { useToast } from '../../hooks/useToast';
import { exportSongsCsv } from '../../services/backupService';
import {
  downloadSampleExcel,
  importExcelSongs,
  parseExcelBuffer,
  type ExcelImportPreview,
} from '../../services/excelImportService';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function SettingsPage() {
  const { songs } = useSongs();
  const { showToast } = useToast();
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [importPreview, setImportPreview] = useState<ExcelImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
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

  const handleDownloadSample = () => {
    const filename = downloadSampleExcel();
    showToast(`Đã tải file mẫu ${filename}`, 'info');
  };

  const handleExcelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const preview = parseExcelBuffer(buffer, songs);

      if (preview.validSongs.length === 0 && preview.errors.length === 0) {
        showToast('File Excel không có dữ liệu bài hát nào', 'error');
        setImportPreview(null);
        return;
      }

      setImportPreview(preview);
    } catch {
      showToast('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.', 'error');
      setImportPreview(null);
    }
  };

  const handleConfirmImport = async (onlyNew: boolean) => {
    if (!importPreview) return;
    const list = onlyNew ? importPreview.newSongs : importPreview.validSongs;
    if (list.length === 0) {
      showToast('Không có bài hát mới nào để nhập', 'info');
      setImportPreview(null);
      return;
    }

    setIsImporting(true);
    try {
      const count = await importExcelSongs(list);
      showToast(`Đã nhập thành công ${count} bài hát`, 'success');
      setImportPreview(null);
    } catch {
      showToast('Nhập dữ liệu từ Excel thất bại', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-zinc-50">Cài đặt & Dữ liệu</h1>
        <p className="mt-0.5 text-xs text-zinc-400">
          Nhập/xuất danh sách bài hát và thông tin ứng dụng MySong
        </p>
      </header>

      {/* Import / Export Excel & CSV */}
      <section className="space-y-2.5 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4">
        <button
          type="button"
          onClick={() => excelInputRef.current?.click()}
          className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-3 text-left text-sm font-semibold text-emerald-300 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <Upload className="h-4 w-4" />
            Nhập từ file Excel
          </span>
          <span className="text-xs font-normal text-emerald-300/80">.xlsx / .xls / .csv</span>
        </button>

        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          onChange={handleExcelFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex w-full items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-left text-sm font-medium text-purple-200 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <Download className="h-4 w-4 text-purple-400" />
            Tải file Excel mẫu
          </span>
          <span className="text-xs text-purple-300/80">.xlsx</span>
        </button>

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

        {/* Excel Import Preview */}
        {importPreview && (
          <div className="mt-2 space-y-3 rounded-2xl border border-purple-500/40 bg-zinc-950/90 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="text-xs leading-relaxed text-zinc-300">
                <p className="font-semibold text-zinc-100">
                  Tìm thấy {importPreview.validSongs.length} bài hát hợp lệ
                </p>
                <p className="mt-1 text-zinc-400">
                  • Bài mới: <strong className="text-emerald-300">{importPreview.newSongs.length}</strong>
                  <br />• Trùng tên & ca sĩ:{' '}
                  <strong className="text-amber-300">{importPreview.duplicateCount}</strong>
                  {importPreview.errors.length > 0 && (
                    <>
                      <br />• Dòng lỗi (bỏ qua):{' '}
                      <strong className="text-rose-400">{importPreview.errors.length}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            {importPreview.errors.length > 0 && (
              <div className="max-h-24 overflow-y-auto rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
                {importPreview.errors.slice(0, 5).map((err) => (
                  <div key={`${err.rowNumber}-${err.reason}`}>
                    Dòng {err.rowNumber}: {err.reason}
                  </div>
                ))}
                {importPreview.errors.length > 5 && (
                  <div className="mt-1 text-rose-300/70">
                    ...và {importPreview.errors.length - 5} dòng lỗi khác
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {importPreview.duplicateCount > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isImporting || importPreview.newSongs.length === 0}
                    onClick={() => handleConfirmImport(true)}
                    className="rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-zinc-950 disabled:opacity-40"
                  >
                    Chỉ thêm {importPreview.newSongs.length} bài mới
                  </button>
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={() => handleConfirmImport(false)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-200 disabled:opacity-40"
                  >
                    Thêm tất cả ({importPreview.validSongs.length})
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isImporting || importPreview.validSongs.length === 0}
                  onClick={() => handleConfirmImport(false)}
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-zinc-950 disabled:opacity-40"
                >
                  Nhập {importPreview.validSongs.length} bài hát
                </button>
              )}

              <button
                type="button"
                disabled={isImporting}
                onClick={() => setImportPreview(null)}
                className="w-full py-1 text-center text-xs text-zinc-500"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
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

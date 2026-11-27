import { TONE_COLORS, TONE_LABELS } from '../../constants/song';
import type { Tone } from '../../types/song';

export function ToneBadge({ tone }: { tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONE_COLORS[tone]}`}
    >
      {TONE_LABELS[tone]}
    </span>
  );
}

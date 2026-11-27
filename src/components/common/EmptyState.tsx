import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

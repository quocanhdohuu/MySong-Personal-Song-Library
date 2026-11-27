import { Outlet, NavLink } from 'react-router-dom';
import { Home, Library, Shuffle, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/library', label: 'Thư viện', icon: Library },
  { to: '/random', label: 'Ngẫu nhiên', icon: Shuffle },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-lg px-4 pb-24 pt-4 safe-top">
        <Outlet />
      </main>

      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800/90 bg-zinc-950/90 backdrop-blur-lg safe-bottom"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-emerald-500/15' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

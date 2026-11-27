import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/Home/HomePage';
import { LibraryPage } from '../pages/Library/LibraryPage';
import { SongFormPage } from '../pages/SongForm/SongFormPage';
import { SongDetailPage } from '../pages/SongDetail/SongDetailPage';
import { RandomPage } from '../pages/Random/RandomPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/favorites" element={<LibraryPage favoritesOnly />} />
        <Route path="/random" element={<RandomPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/songs/new" element={<SongFormPage />} />
        <Route path="/songs/:id" element={<SongDetailPage />} />
        <Route path="/songs/:id/edit" element={<SongFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

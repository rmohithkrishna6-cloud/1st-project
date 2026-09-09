import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { MotionBackground } from './components/MotionBackground';
import { LanguageModal } from './components/LanguageModal';
import { AuthModal } from './components/AuthModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EmbedModal } from './components/EmbedModal';
import { FeedbackModal } from './components/FeedbackModal';
import { CustomCursor } from './components/CustomCursor';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { GalleryPage } from './pages/GalleryPage';
import { useAppStore } from './store/useAppStore';
import { fetchLanguages } from './services/api';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const { setLanguages, setCurrentLanguage } = useAppStore();

  useEffect(() => {
    fetchLanguages()
      .then((langs) => {
        setLanguages(langs);
        const { currentLanguage } = useAppStore.getState();
        if (!currentLanguage && langs.length > 0) {
          const firstActive = langs.find((l) => l.status === 'active') || langs[0];
          setCurrentLanguage(firstActive);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-[#0B1A12] text-white flex flex-col selection:bg-[#B4FF00] selection:text-[#0B1A12]">
          <CustomCursor />
          <MotionBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
              </Routes>
            </main>
          </div>

          <LanguageModal />
          <AuthModal />
          <HistoryDrawer />
          <EmbedModal />
          <FeedbackModal />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;

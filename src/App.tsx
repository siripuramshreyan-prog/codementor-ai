import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy, useEffect } from 'react';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CursorGlow } from './components/ui/CursorGlow';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { PageLoader } from './components/ui/PageLoader';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Heavier app-shell pages (Monaco editor, Recharts) are split out of the
// initial bundle and only fetched when the user actually navigates to them.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Problems = lazy(() => import('./pages/Problems'));
const ProblemDetail = lazy(() => import('./pages/ProblemDetail'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-void">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-brand-blue border-r-brand-violet" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
          <Route path="/problems/:slug" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PageLoader />
          <ScrollProgress />
          <CursorGlow />
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

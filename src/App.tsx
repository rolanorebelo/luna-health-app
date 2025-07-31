import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout Components
// Make sure the file exists at this path, or update the import if the filename or path is different
import Layout from './components/layout/Layout'; // <-- Check that src/components/layout/Layout.tsx exists
import AuthLayout from './components/layout/AuthLayout';

// Page Components
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CyclePage from './pages/CyclePage';
import ChatPage from './pages/ChatPage';
import PhotoAnalysisPage from './pages/PhotoAnalysisPage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Hooks
import useAuthStore from './stores/authStore';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            } />

            {/* Protected Routes */}
            {isAuthenticated ? (
              <>
                <Route path="/onboarding" element={
                  <Layout>
                    <OnboardingPage />
                  </Layout>
                } />
                <Route path="/" element={
                  <Layout>
                    <HomePage />
                  </Layout>
                } />
                <Route path="/dashboard" element={
                  <Layout>
                    <DashboardPage />
                  </Layout>
                } />
                <Route path="/cycle" element={
                  <Layout>
                    <CyclePage />
                  </Layout>
                } />
                <Route path="/chat" element={
                  <Layout>
                    <ChatPage />
                  </Layout>
                } />
                <Route path="/photo-analysis" element={
                  <Layout>
                    <PhotoAnalysisPage />
                  </Layout>
                } />
                <Route path="/insights" element={
                  <Layout>
                    <InsightsPage />
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <ProfilePage />
                  </Layout>
                } />
                <Route path="/settings" element={
                  <Layout>
                    <SettingsPage />
                  </Layout>
                } />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
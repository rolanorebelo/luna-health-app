import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Import all page components
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CyclePage from './pages/CyclePage';
import PhotoAnalysisPage from './pages/PhotoAnalysisPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

// Import layout components
import Layout from './components/layout/Layout';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Luna...</h3>
      <p className="text-gray-600">Your AI health companion is starting up</p>
    </div>
  </div>
);

// Debug component (optional - for testing)
const FlowDebug: React.FC = () => {
  const { profile, isAuthenticated, logout } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 text-xs">
      <h4 className="font-bold mb-2">🔍 Flow Debug</h4>
      <div className="space-y-1">
        <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Profile: {profile?.id ? '✅' : '❌'}</div>
        <div>Onboarding: {profile?.onboardingCompleted ? '✅' : '❌'}</div>
        <div>Name: {profile?.firstName || 'None'}</div>
      </div>
      <button 
        onClick={logout}
        className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full"
      >
        Reset
      </button>
    </div>
  );
};

function App() {
  const { isAuthenticated, profile, isLoading } = useAuthStore();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES - Only available when NOT authenticated */}
        {!isAuthenticated ? (
          <>
            {/* Welcome page is the default landing page */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Redirect any other unknown routes to welcome */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </>
        ) : (
          <>
            {/* ONBOARDING CHECK - If authenticated but onboarding not complete */}
            {!profile?.onboardingCompleted ? (
              <>
                <Route path="/onboarding" element={<OnboardingPage />} />
                {/* Redirect any other routes to onboarding */}
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </>
            ) : (
              <>
                {/* MAIN APP ROUTES - Only available when authenticated AND onboarding complete */}
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
                
                <Route path="/photo-analysis" element={
                  <Layout>
                    <PhotoAnalysisPage />
                  </Layout>
                } />
                
                <Route path="/chat" element={
                  <Layout>
                    <ChatPage />
                  </Layout>
                } />
                
                <Route path="/profile" element={
                  <Layout>
                    <ProfilePage />
                  </Layout>
                } />
                
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        )}
      </Routes>
      
      {/* Debug component - only shows in development */}
      <FlowDebug />
    </Router>
  );
}

export default App;
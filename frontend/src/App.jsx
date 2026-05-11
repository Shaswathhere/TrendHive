import { LandingPage } from './pages/LandingPage'
import React from 'react'
import { SignupPage } from './pages/SignUp'
import { LoginPage } from './pages/Login'
import {Routes, Route} from 'react-router-dom';
import { HomePage } from './pages/Home'
import { TrendBotPage } from './pages/TrendBot'
import { InfoHubPage } from './pages/InfoHub'
import { ProfilePage } from './pages/Profile'
import { OnboardingPage } from './pages/Onboarding'
import { DashboardLayout } from './components/layout/dashboardLayout'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/routeGuards'
import { ThemeProvider } from './context/ThemeContext'
import './App.css' 

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="trendbot" element={<TrendBotPage />} />
          <Route path="infohub" element={<InfoHubPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App

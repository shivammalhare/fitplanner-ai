// src/App.tsx

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'

import { useAuth } from './hooks/useAuth'
import { supabase } from './utils/supabase'

import { LoadingScreen } from './components/animations/loadingScreen'
import { AuthForm } from './components/AuthForm'
import { BottomNavBar } from './components/layout/BottomNavBar'
import { Profile } from './pages/Profile'
import { Dashboard } from './pages/Dashboard'
import { WorkoutPlanner } from './pages/WorkoutPlanner'
import { Progress } from './pages/Progress'
import { WorkoutSession } from './pages/WorkoutSession'
import { ProfileModal } from './components/ProfileModal'

function App() {
  // Always at top: hooks
  const { user, loading, signOut } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user && showProfileModal) {
      ;(async () => {
        const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
        setProfile(data)
      })()
    } else {
      setProfile(null)
    }
  }, [user, showProfileModal])

  if (loading) return <LoadingScreen isLoading={true} />

  if (!user) return <AuthForm />

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPlanner />} />
          <Route path="/workout/session/:workoutId" element={<WorkoutSession />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <BottomNavBar onProfileClick={() => setShowProfileModal(true)} />

        {showProfileModal && (
          <ProfileModal
            profile={profile}
            onClose={() => setShowProfileModal(false)}
            onLogout={() => {
              setShowProfileModal(false)
              signOut()
            }}
          />
        )}
      </div>
    </Router>
  )
}

export default App

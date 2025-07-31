// src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { supabase } from './utils/supabase';

import { LoadingScreen } from './components/animations/loadingScreen';
import { AuthForm } from './components/AuthForm';
import { BottomNavBar } from './components/layout/BottomNavBar';
import { Dashboard } from './pages/Dashboard';
import { WorkoutPlanner } from './pages/WorkoutPlanner';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { ProfileModal } from './components/ProfileModal';

function App() {
  // Always call hooks at the very top
  const { user, loading, signOut } = useAuth();

  // Local state for controlling profile modal visibility and user profile data
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile data when profile modal is opened
  useEffect(() => {
    if (user && showProfileModal) {
      (async () => {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      })();
    } else {
      setProfile(null);
    }
  }, [user, showProfileModal]);

  // Handle loading state (while checking auth session)
  if (loading) {
    return <LoadingScreen isLoading={true} />;
  }

  // Show Auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // User is authenticated, render the main app with routes and navigation
  return (
    <Router>
      <div className="min-h-screen pb-16 bg-gradient-to-br from-gray-900 to-black">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutPlanner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          {/* Add additional routes as needed */}
        </Routes>

        {/* Bottom Navigation Bar */}
        <BottomNavBar onProfileClick={() => setShowProfileModal(true)} />

        {/* Profile Modal - mobile friendly */}
        {showProfileModal && (
          <ProfileModal
            profile={profile}
            onClose={() => setShowProfileModal(false)}
            onLogout={() => {
              setShowProfileModal(false);
              signOut();
            }}
          />
        )}
      </div>
    </Router>
  );
}

export default App;

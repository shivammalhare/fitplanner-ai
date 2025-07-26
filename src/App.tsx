import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from './components/animations/loadingScreen';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { Dashboard } from './pages/Dashboard';
import { WorkoutPlanner } from './pages/WorkoutPlanner';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Header />
        <PageTransition>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutPlanner />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </PageTransition>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

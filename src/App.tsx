import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingScreen } from './components/animations/loadingScreen';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import './index.css'; // Ensure global styles are imported
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* More routes will be added in next days */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

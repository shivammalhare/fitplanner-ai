import React from 'react';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  // Quick test div with obvious Tailwind classes
  return (
    <div className="App">
      {/* Test div - remove this after confirming styles work */}
      <div className="bg-red-500 text-white p-4 text-center">
        🚨 If you see red background, TailwindCSS is working! 🚨
      </div>
      
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Loading...</div>
        </div>
      ) : !user ? (
        <AuthForm />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to FitPlanner AI!</h1>
            <p className="text-gray-400">You are logged in as: {user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

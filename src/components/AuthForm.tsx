import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else alert('Check your email for verification!');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-sm mx-auto">
        {/* Logo Section - Larger for mobile */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-5xl">💪</span>
            <div>
              <h1 className="text-2xl font-bold text-white">FitPlanner</h1>
              <p className="text-sm text-orange-500 font-medium">AI</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Your pocket gym trainer</p>
        </div>

        {/* Auth Card - Mobile optimized */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            {isSignUp ? 'Join FitPlanner' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-lg py-4" // Larger input for mobile
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-lg py-4"
            />
            
            {/* Large mobile-friendly buttons */}
            <Button 
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg font-semibold"
              loading={loading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={signInWithGoogle}
              variant="secondary"
              size="lg"
              className="w-full py-4 text-lg"
            >
              <span className="mr-2">🔗</span>
              Continue with Google
            </Button>
          </form>
          
          {/* Toggle Auth Mode */}
          <div className="text-center pt-6 border-t border-gray-700 mt-6">
            <span className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account?' : 'New to FitPlanner?'}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-orange-500 ml-2 hover:text-orange-400 font-semibold transition-colors text-sm"
            >
              {isSignUp ? 'Sign In' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

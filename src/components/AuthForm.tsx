import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, signInWithGoogle, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) alert(error.message)
      else alert('Check your email for verification!')
    } else {
      const { error } = await signIn(email, password)
      if (error) alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {isSignUp ? 'Sign Up' : 'Sign In'} to FitPlanner AI
      </h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-3 border rounded"
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 border rounded"
        required
      />
      
      <button 
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
      >
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </button>
      
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full bg-red-500 text-white p-3 rounded mt-2 hover:bg-red-600"
      >
        Continue with Google
      </button>
      
      <p className="text-center mt-4">
        {isSignUp ? 'Already have an account?' : 'Need an account?'}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-500 ml-1 hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </form>
  )
}

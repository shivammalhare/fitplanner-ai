import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <span className="text-2xl">💪</span>
          <h1 className="text-xl font-bold text-white">FitPlanner AI</h1>
        </motion.div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.email}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
};

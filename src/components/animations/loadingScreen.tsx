import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isLoading?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading = true }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black"
    >
      {/* Spinning Logo Animation */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-orange-500">💪</span>
        </motion.div>
      </div>
      
      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-1/3 text-white text-lg font-medium"
      >
        Loading FitPlanner AI...
      </motion.p>
    </motion.div>
  );
};

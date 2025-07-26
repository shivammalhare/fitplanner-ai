import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 text-white py-8 mt-16"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <span className="text-2xl">💪</span>
          <h3 className="text-xl font-bold">FitPlanner AI</h3>
        </div>
        <p className="text-gray-400 mb-4">
          Your AI-powered fitness companion for smarter workouts
        </p>
        <p className="text-gray-500 text-sm">
          © 2024 FitPlanner AI. Built with ❤️ for fitness enthusiasts.
        </p>
      </div>
    </motion.footer>
  );
};

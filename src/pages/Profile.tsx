import React from 'react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20"
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <p className="text-gray-400">Profile features coming soon...</p>
      </div>
    </motion.div>
  );
};

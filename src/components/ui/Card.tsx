import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg
        ${hover ? 'hover:shadow-xl hover:border-gray-600' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

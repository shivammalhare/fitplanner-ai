import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-200">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            transition-all duration-200 transform
            ${isFocused ? 'scale-101' : 'scale-100'}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

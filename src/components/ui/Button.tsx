import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    font-semibold rounded-xl transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform active:scale-95 touch-manipulation
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:active:scale-100
  `;

  const variantClasses: Record<string, string> = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    link: 'text-orange-500 underline hover:text-orange-400 bg-transparent shadow-none',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-sm min-h-[44px]', // Minimum 44px height for touch
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${block ? 'w-full' : 'inline-block'}
        ${loading ? 'pointer-events-none' : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

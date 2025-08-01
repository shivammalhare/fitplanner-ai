import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'home', icon: '🏠', label: 'Home', route: '/' },
  { id: 'workout', icon: '💪', label: 'Workout', route: '/workout' },
  { id: 'progress', icon: '📈', label: 'Progress', route: '/progress' },
  { id: 'profile', icon: '👤', label: 'Profile', route: '/profile' },
];

export const BottomNavBar: React.FC<{ onProfileClick?: () => void }> = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 flex justify-around h-16">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.id === 'profile' && onProfileClick) onProfileClick();
            else navigate(tab.route);
          }}
          className={`flex-1 flex flex-col items-center justify-center text-xs font-medium
            ${location.pathname === tab.route ? 'text-orange-500' : 'text-gray-400'}`}
        >
          <span className="text-2xl">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

import React from 'react';

export const ProfileModal: React.FC<{ profile: any; onClose: () => void; onLogout: () => void }> = ({
  profile, onClose, onLogout
}) => {
  if (!profile) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-gray-900 rounded-t-3xl sm:rounded-xl shadow-lg w-full sm:w-96 p-6 relative animate-fadeInUp">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 text-xl"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-4xl">
            {profile.full_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <h2 className="text-xl font-semibold mt-3 mb-1">{profile.full_name || 'User'}</h2>
          <p className="text-gray-400 text-sm mb-2">{profile.email}</p>
          {/* Editable profile fields (can make these a form if desired) */}
          <dl className="divide-y divide-gray-700 w-full mt-4">
            <div className="flex justify-between py-2">
              <dt className="text-gray-400">Goal</dt>
              <dd className="font-medium">{profile.fitness_goal}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-gray-400">Experience</dt>
              <dd className="font-medium">{profile.experience_level}</dd>
            </div>
          </dl>
          <button
            onClick={onLogout}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-base"
          >Logout</button>
        </div>
      </div>
    </div>
  );
};

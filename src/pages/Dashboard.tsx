import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const [selectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  
  // Mock workout data - will be replaced with AI generation
  const todaysWorkout = {
    type: selectedDay === 'Monday' ? 'Chest & Triceps' : 
          selectedDay === 'Tuesday' ? 'Back & Biceps' :
          selectedDay === 'Wednesday' ? 'Legs & Core' :
          selectedDay === 'Thursday' ? 'Shoulders & Arms' :
          selectedDay === 'Friday' ? 'Chest & Triceps' :
          'Rest Day',
    exercises: 4,
    duration: '45-60 min',
    difficulty: 'Intermediate'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Mobile Header */}
      <div className="bg-black/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">FitPlanner AI</h1>
              <p className="text-sm text-gray-400">Ready to train?</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Today</p>
              <p className="text-lg font-semibold text-orange-500">{selectedDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24"> {/* Bottom padding for navigation */}
        
        {/* Today's Workout Hero Card */}
        <Card className="mb-6 bg-gradient-to-r from-orange-600 to-red-600 border-orange-500">
          <div className="text-center">
            <div className="text-4xl mb-3">🔥</div>
            <h2 className="text-2xl font-bold text-white mb-2">Today's Focus</h2>
            <h3 className="text-xl text-orange-100 mb-4">{todaysWorkout.type}</h3>
            
            <div className="flex justify-around text-sm text-orange-100 mb-6">
              <div>
                <div className="font-semibold">{todaysWorkout.exercises}</div>
                <div className="opacity-80">Exercises</div>
              </div>
              <div>
                <div className="font-semibold">{todaysWorkout.duration}</div>
                <div className="opacity-80">Duration</div>
              </div>
              <div>
                <div className="font-semibold">{todaysWorkout.difficulty}</div>
                <div className="opacity-80">Level</div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full bg-white text-orange-600 hover:bg-gray-100 font-semibold"
            >
              🚀 Start Workout
            </Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center py-6">
            <div className="text-2xl font-bold text-orange-500">7</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </Card>
          <Card className="text-center py-6">
            <div className="text-2xl font-bold text-blue-500">245</div>
            <div className="text-sm text-gray-400">Total Workouts</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold text-white">Progress</h4>
                <p className="text-sm text-gray-400">Track your gains</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">View</Button>
          </Card>

          <Card className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h4 className="font-semibold text-white">AI Coach</h4>
                <p className="text-sm text-gray-400">Get personalized tips</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Chat</Button>
          </Card>

          <Card className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🍎</div>
              <div>
                <h4 className="font-semibold text-white">Nutrition</h4>
                <p className="text-sm text-gray-400">Meal planning</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Plan</Button>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

// Bottom Navigation Component
const BottomNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'workout', icon: '💪', label: 'Workout' },
    { id: 'progress', icon: '📈', label: 'Progress' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-center transition-colors ${
              activeTab === tab.id 
                ? 'text-orange-500' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{tab.icon}</div>
            <div className="text-xs font-medium">{tab.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

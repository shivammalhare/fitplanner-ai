import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WorkoutGenerator } from '../components/WorkoutGenerator';

export const Dashboard: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  
  if (showGenerator) {
    return <WorkoutGenerator />;
  }

  // ... rest of your existing dashboard code

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
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

      <div className="px-4 py-6 pb-24">
        {/* AI Workout Generator CTA */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500">
          <div className="text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h2 className="text-xl font-bold text-white mb-2">AI Workout Generator</h2>
            <p className="text-purple-100 mb-4">Get a personalized workout powered by Perplexity Pro</p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full bg-black text-purple-600 hover:bg-gray-100 font-semibold"
              onClick={() => setShowGenerator(true)}
            >
              🚀 Generate Smart Workout
            </Button>
          </div>
        </Card>

        {/* Rest of your existing dashboard content */}
        {/* ... */}
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { TextReveal } from '../components/animations/TextReveal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TextReveal className="text-4xl font-bold mb-2">
            Welcome to FitPlanner AI
          </TextReveal>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400 mb-8"
          >
            Your personalized fitness journey starts here
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-xl font-semibold mb-2">Today's Workout</h3>
              <p className="text-gray-400 mb-4">Chest & Triceps</p>
              <Button variant="primary">Start Workout</Button>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-2">Progress</h3>
              <p className="text-gray-400 mb-4">Track your improvements</p>
              <Button variant="secondary">View Progress</Button>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-2">AI Coach</h3>
              <p className="text-gray-400 mb-4">Get personalized advice</p>
              <Button variant="primary">Chat Now</Button>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

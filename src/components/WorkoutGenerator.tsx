import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutGenerator } from '../hooks/useWorkoutGenerator';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useNavigate } from 'react-router-dom';

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', emoji: '💪' },
  { id: 'back', name: 'Back', emoji: '🔙' },
  { id: 'shoulders', name: 'Shoulders', emoji: '🤷' },
  { id: 'arms', name: 'Arms', emoji: '💪' },
  { id: 'legs', name: 'Legs', emoji: '🦵' },
  { id: 'core', name: 'Core', emoji: '🫃' }
];

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', name: 'Bodyweight Only', emoji: '🏃' },
  { id: 'dumbbells', name: 'Dumbbells', emoji: '🏋️' },
  { id: 'barbell', name: 'Barbell', emoji: '🏋️‍♀️' },
  { id: 'resistance_bands', name: 'Resistance Bands', emoji: '🎗️' },
  { id: 'full_gym', name: 'Full Gym Access', emoji: '🏟️' }
];

// WorkoutPreview component integrated here
const WorkoutPreview: React.FC<{ workout: any; onStart: (id: string) => void }> = ({ workout, onStart }) => {
  return (
    <div className="p-4 bg-gray-800 rounded shadow mb-4">
      <h3 className="text-xl font-bold text-white mb-2">{workout.title}</h3>
      {/* You can extend this section with more workout summary details */}
      <div className="mb-4 text-gray-300">{workout.description}</div>

      <Button onClick={() => onStart(workout.workoutId)} variant="primary" className="w-full">
        Start Workout
      </Button>
    </div>
  );
};

export const WorkoutGenerator: React.FC = () => {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['chest']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['full_gym']);
  const [duration, setDuration] = useState(45);
  const [goal, setGoal] = useState('muscle_gain');
  const [experience, setExperience] = useState('intermediate');

  const { generateWorkout, currentWorkout, loading, error } = useWorkoutGenerator();

  const navigate = useNavigate();

  const handleMuscleToggle = (muscleId: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscleId)
        ? prev.filter(id => id !== muscleId)
        : [...prev, muscleId]
    );
  };

  const handleEquipmentToggle = (equipmentId: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleGenerateWorkout = async () => {
    if (selectedMuscles.length === 0) {
      alert('Please select at least one muscle group');
      return;
    }
    if (selectedEquipment.length === 0) {
      alert('Please select available equipment');
      return;
    }

    await generateWorkout({
      goal,
      experience,
      targetMuscles: selectedMuscles,
      duration,
      equipment: selectedEquipment
    });
  };

  // Navigate to the workout session page when starting workout
  const startWorkout = (id: string) => {
    navigate(`/workout/session/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">AI Workout Generator</h1>
            <p className="text-sm text-gray-400">Powered by Perplexity Pro</p>
          </div>
          <div className="text-2xl">🤖</div>
        </div>
      </div>

      <div className="px-4 py-6 pb-24 overflow-auto">
        {/* Quick Goals */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Goal</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'muscle_gain', name: 'Build Muscle', emoji: '💪' },
              { id: 'fat_loss', name: 'Lose Fat', emoji: '🔥' },
              { id: 'strength', name: 'Get Stronger', emoji: '⚡' },
              { id: 'maintenance', name: 'Stay Fit', emoji: '✨' }
            ].map((goalOption) => (
              <button
                key={goalOption.id}
                onClick={() => setGoal(goalOption.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  goal === goalOption.id
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{goalOption.emoji}</div>
                <div className="text-sm font-medium">{goalOption.name}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Muscle Groups */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Target Muscles</h3>
          <div className="grid grid-cols-3 gap-3">
            {MUSCLE_GROUPS.map((muscle) => (
              <button
                key={muscle.id}
                onClick={() => handleMuscleToggle(muscle.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedMuscles.includes(muscle.id)
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300'
                }`}
              >
                <div className="text-xl mb-1">{muscle.emoji}</div>
                <div className="text-xs font-medium">{muscle.name}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Equipment */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Equipment</h3>
          <div className="space-y-3">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => handleEquipmentToggle(equipment.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                  selectedEquipment.includes(equipment.id)
                    ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300'
                }`}
              >
                <span className="text-xl">{equipment.emoji}</span>
                <span className="font-medium">{equipment.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Duration & Experience */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <h4 className="text-white font-semibold mb-3">Duration</h4>
            <div className="space-y-2">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`w-full p-2 rounded-lg text-sm ${
                    duration === mins
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="text-white font-semibold mb-3">Experience</h4>
            <div className="space-y-2">
              {[
                { id: 'beginner', name: 'Beginner' },
                { id: 'intermediate', name: 'Intermediate' },
                { id: 'advanced', name: 'Advanced' }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setExperience(level.id)}
                  className={`w-full p-2 rounded-lg text-sm ${
                    experience === level.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-500/20">
            <p className="text-red-300 text-center">{error}</p>
          </Card>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateWorkout}
          loading={loading}
          variant="primary"
          size="lg"
          className="w-full mb-6"
        >
          🤖 Generate AI Workout
        </Button>

        {/* Show Workout Preview if generated */}
        {currentWorkout && (
          <WorkoutPreview workout={currentWorkout} onStart={startWorkout} />
        )}
      </div>
    </div>
  );
};

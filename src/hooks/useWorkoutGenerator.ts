import { useState } from 'react';
import { openaiService } from '../services/openaiService';
import { supabase } from '../utils/supabase';

interface WorkoutGenerationParams {
  goal: string;
  experience: string;
  targetMuscles: string[];
  duration: number;
  equipment: string[];
}

export const useWorkoutGenerator = () => {
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async (params: WorkoutGenerationParams) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user preferences from database
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Prepare workout request
      const workoutRequest = {
        goal: (userProfile?.fitness_goal || params.goal) as any,
        experience: (userProfile?.experience_level || params.experience) as any,
        targetMuscles: params.targetMuscles,
        duration: params.duration,
        equipment: params.equipment,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      };

      // Generate workout with OpenAI
      const generatedWorkout = await openaiService.generateWorkout(workoutRequest);

      // Save to database
      const { data: savedWorkout, error: saveError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          muscle_groups: params.targetMuscles,
          exercises: generatedWorkout.exercises,
          ai_generated: true,
          completed: false,
          goal: workoutRequest.goal

        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Set the current workout with database ID
      setCurrentWorkout({
        ...generatedWorkout,
        workoutId: savedWorkout.id
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout');
      console.error('Workout generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateWorkout,
    currentWorkout,
    loading,
    error
  };
};

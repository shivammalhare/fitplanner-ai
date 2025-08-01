import OpenAI from 'openai';

interface WorkoutRequest {
  goal: 'muscle_gain' | 'fat_loss' | 'strength' | 'maintenance';
  experience: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  duration: number;
  equipment: string[];
  dayOfWeek: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  instructions: string;
  tips: string;
  muscle_groups: string[];
  difficulty: string;
}

interface WorkoutPlan {
  title: string;
  description: string;
  estimated_duration: number;
  difficulty: string;
  exercises: Exercise[];
  warm_up: string[];
  cool_down: string[];
  notes: string;
}

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not found. Using mock workouts for development.');
      this.openai = null as any;
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Only for development!
      });
      console.log('✅ OpenAI API initialized successfully');
    }
  }

  async generateWorkout(request: WorkoutRequest): Promise<WorkoutPlan> {
    // Use mock if no API key
    if (!this.openai) {
      return this.generateMockWorkout(request);
    }

    try {
      const prompt = this.createWorkoutPrompt(request);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Cost-effective model perfect for fitness
        messages: [
          {
            role: "system",
            content: `You are a certified personal trainer and exercise physiologist with 10+ years of experience. Create safe, effective, evidence-based workout plans tailored to individual needs. Always prioritize proper form and injury prevention.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      return this.parseWorkoutResponse(response || '');

    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to mock workout
      return this.generateMockWorkout(request);
    }
  }

  private createWorkoutPrompt(request: WorkoutRequest): string {
    const equipmentText = request.equipment.includes('bodyweight') 
      ? 'bodyweight exercises only' 
      : `gym equipment: ${request.equipment.join(', ')}`;

    return `
Create a detailed ${request.duration}-minute workout plan in JSON format for:

**User Profile:**
- Goal: ${request.goal.replace('_', ' ')}
- Experience Level: ${request.experience}
- Target Muscles: ${request.targetMuscles.join(', ')}
- Available Equipment: ${equipmentText}
- Workout Day: ${request.dayOfWeek}

**Requirements:**
1. Include 4-6 exercises appropriate for ${request.experience} level
2. Provide specific sets, reps, and rest periods
3. Include detailed form instructions for safety
4. Add warm-up and cool-down recommendations
5. Focus on ${request.goal.replace('_', ' ')} goals
6. Ensure exercises target: ${request.targetMuscles.join(' and ')}

**JSON Response Format:**
{
  "title": "Workout name for ${request.dayOfWeek}",
  "description": "Brief description of workout focus",
  "estimated_duration": ${request.duration},
  "difficulty": "${request.experience}",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "8-10",
      "rest_seconds": 90,
      "instructions": "Detailed step-by-step form instructions",
      "tips": "Key safety tips and form cues",
      "muscle_groups": ["primary", "secondary"],
      "difficulty": "${request.experience}"
    }
  ],
  "warm_up": [
    "5 minutes light cardio",
    "Dynamic stretching routine",
    "Activation exercises"
  ],
  "cool_down": [
    "5 minutes walking",
    "Static stretching routine",
    "Breathing exercises"
  ],
  "notes": "Important workout notes and progression tips"
}

Focus on evidence-based exercises that are safe and effective for ${request.goal.replace('_', ' ')}.
    `;
  }

  private parseWorkoutResponse(response: string): WorkoutPlan {
    try {
      const cleanResponse = response.trim();
      const workout = JSON.parse(cleanResponse);
      
      // Validate the response structure
      if (!workout.exercises || !Array.isArray(workout.exercises)) {
        throw new Error('Invalid workout structure');
      }

      return {
        title: workout.title || 'Custom Workout',
        description: workout.description || 'AI-generated workout plan',
        estimated_duration: workout.estimated_duration || 45,
        difficulty: workout.difficulty || 'intermediate',
        exercises: workout.exercises,
        warm_up: workout.warm_up || ['5 minutes dynamic warm-up'],
        cool_down: workout.cool_down || ['5 minutes stretching'],
        notes: workout.notes || 'Focus on proper form and gradual progression.'
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // Return fallback workout
      return this.getFallbackWorkout();
    }
  }

  private generateMockWorkout(request: WorkoutRequest): WorkoutPlan {
    const mockWorkouts = {
      chest: {
        title: "Chest Power Session",
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: request.experience === 'beginner' ? '8-12' : '12-15',
            rest_seconds: 60,
            instructions: "Start in plank position with hands slightly wider than shoulders. Lower chest to ground, keeping body straight. Push back up to starting position.",
            tips: "Keep core engaged, don't let hips sag. Focus on controlled movement.",
            muscle_groups: ["chest", "triceps", "shoulders"],
            difficulty: request.experience
          },
          {
            name: "Incline Push-ups",
            sets: 3,
            reps: "10-15",
            rest_seconds: 60,
            instructions: "Place hands on elevated surface (bench, step). Perform push-up motion.",
            tips: "Higher elevation = easier. Lower elevation = harder.",
            muscle_groups: ["chest", "triceps"],
            difficulty: request.experience
          }
        ]
      },
      back: {
        title: "Back Builder Workout",
        exercises: [
          {
            name: "Pull-ups/Assisted Pull-ups",
            sets: 3,
            reps: request.experience === 'beginner' ? '3-6' : '6-10',
            rest_seconds: 120,
            instructions: "Hang from bar with hands shoulder-width apart. Pull body up until chin clears bar.",
            tips: "Use assistance band if needed. Focus on full range of motion.",
            muscle_groups: ["back", "biceps"],
            difficulty: request.experience
          },
          {
            name: "Bent-over Rows",
            sets: 3,
            reps: "8-12",
            rest_seconds: 90,
            instructions: "Hinge at hips, keep back straight. Pull weights to lower chest.",
            tips: "Squeeze shoulder blades together. Don't round your back.",
            muscle_groups: ["back", "biceps"],
            difficulty: request.experience
          }
        ]
      },
      legs: {
        title: "Leg Power Session",
        exercises: [
          {
            name: "Bodyweight Squats",
            sets: 3,
            reps: request.experience === 'beginner' ? '12-15' : '15-20',
            rest_seconds: 90,
            instructions: "Stand with feet shoulder-width apart. Lower hips back and down as if sitting in chair.",
            tips: "Keep chest up, knees track over toes. Go as low as comfortable.",
            muscle_groups: ["quadriceps", "glutes"],
            difficulty: request.experience
          },
          {
            name: "Lunges",
            sets: 3,
            reps: "10-12 each leg",
            rest_seconds: 90,
            instructions: "Step forward with one leg, lower back knee toward ground.",
            tips: "Keep front knee over ankle. Push through front heel to return.",
            muscle_groups: ["quadriceps", "glutes", "hamstrings"],
            difficulty: request.experience
          }
        ]
      }
    };

    const primaryMuscle = request.targetMuscles[0] || 'chest';
    const baseWorkout = mockWorkouts[primaryMuscle as keyof typeof mockWorkouts] || mockWorkouts.chest;

    return {
      title: `${request.dayOfWeek} ${baseWorkout.title}`,
      description: `${request.goal.replace('_', ' ')} focused workout for ${request.experience} level`,
      estimated_duration: request.duration,
      difficulty: request.experience,
      exercises: baseWorkout.exercises,
      warm_up: [
        "5 minutes light cardio (marching in place, arm circles)",
        "Dynamic stretching - leg swings, arm circles",
        "Bodyweight movement prep"
      ],
      cool_down: [
        "5 minutes walking or light movement",
        "Static stretching - hold each stretch 30 seconds",
        "Deep breathing and relaxation"
      ],
      notes: `Great ${request.goal.replace('_', ' ')} workout! Focus on proper form over speed. Progress gradually by increasing reps or sets each week.`
    };
  }

  private getFallbackWorkout(): WorkoutPlan {
    return {
      title: "Basic Strength Training",
      description: "A fundamental full-body workout",
      estimated_duration: 45,
      difficulty: "beginner",
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: "8-12",
          rest_seconds: 60,
          instructions: "Standard push-up form with proper alignment",
          tips: "Keep core engaged throughout the movement",
          muscle_groups: ["chest", "triceps", "shoulders"],
          difficulty: "beginner"
        }
      ],
      warm_up: ["5 minutes light movement"],
      cool_down: ["5 minutes stretching"],
      notes: "Focus on form and gradual progression"
    };
  }

  // Method to get exercise alternatives
  async getExerciseAlternatives(exerciseName: string, targetMuscle: string): Promise<string[]> {
    if (!this.openai) {
      return ["Alternative exercise 1", "Alternative exercise 2", "Alternative exercise 3"];
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Provide 4 alternative exercises for "${exerciseName}" that target the same muscle group (${targetMuscle}). Return only a JSON array of exercise names: ["exercise1", "exercise2", "exercise3", "exercise4"]`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response || '[]');
    } catch (error) {
      console.error('Error getting alternatives:', error);
      return [`${exerciseName} variation 1`, `${exerciseName} variation 2`];
    }
  }
}

export const openaiService = new OpenAIService();

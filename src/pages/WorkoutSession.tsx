import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface ExerciseSet {
  reps: string;
  weight: number;
  completed: boolean;
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
  userSets: ExerciseSet[];
}

interface Workout {
  id: string;
  title: string;
  description: string;
  estimated_duration: number | null;
  difficulty: string;
  exercises: Exercise[];
  warm_up: string[];
  cool_down: string[];
  notes: string | null;
  completed: boolean;
  date: string;
}

export const WorkoutSession: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch workout and initialize userSets for each exercise
  useEffect(() => {
    if (!user || !workoutId) {
      setLoading(false);
      return;
    }
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("id", workoutId)
          .single();

        if (error || !data) {
          setWorkout(null);
          setLoading(false);
          return;
        }
        let exercisesArray: any[] = [];
        if (Array.isArray(data.exercises)) exercisesArray = data.exercises;
        else if (typeof data.exercises === "string") {
          try {
            const parsed = JSON.parse(data.exercises);
            if (Array.isArray(parsed)) exercisesArray = parsed;
          } catch {
            exercisesArray = [];
          }
        }
        const exercisesWithUserSets: Exercise[] = (exercisesArray ?? []).map((ex) => ({
          ...ex,
          userSets: Array(Number(ex.sets) || 0)
            .fill(null)
            .map(() => ({ reps: "", weight: 0, completed: false })),
        }));
        setWorkout({ ...data, exercises: exercisesWithUserSets });
      } catch {
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [user, workoutId]);

  // Rest timer
  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) {
      clearInterval(timerRef.current!);
      setTimer(null);
      return;
    }
    timerRef.current = setInterval(
      () => setTimer((prev) => (prev ? prev - 1 : null)),
      1000
    );
    return () => clearInterval(timerRef.current!);
  }, [timer]);

  const handleSetInputChange = (
    exIdx: number,
    setIdx: number,
    field: "weight" | "reps",
    val: string
  ) => {
    if (!workout) return;
    const updatedExercises = [...(workout.exercises ?? [])];
    if (!Array.isArray(updatedExercises[exIdx]?.userSets)) {
      updatedExercises[exIdx].userSets = [];
    }
    const userSets: ExerciseSet[] = Array.isArray(updatedExercises[exIdx].userSets)
      ? [...updatedExercises[exIdx].userSets]
      : [];
    const setEntry: ExerciseSet = userSets[setIdx] ?? { reps: "", weight: 0, completed: false };

    if (field === "weight") setEntry.weight = Number(val);
    else setEntry.reps = val;
    userSets[setIdx] = setEntry;
    updatedExercises[exIdx].userSets = userSets;
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleCompleteSet = () => {
    if (!workout) return;
    const ex = workout.exercises?.[activeExerciseIndex];
    const userSets = Array.isArray(ex?.userSets) ? ex.userSets : [];
    const curSet = userSets?.[activeSetIndex];
    if (!curSet) return;
    if (!curSet.reps || curSet.weight === undefined || curSet.weight <= 0) {
      alert("Please enter reps and a positive weight before completing the set");
      return;
    }
    curSet.completed = true;
    const updatedExercises = [...(workout.exercises ?? [])];
    updatedExercises[activeExerciseIndex].userSets = userSets;
    setWorkout({ ...workout, exercises: updatedExercises });

    if (activeSetIndex < ex.sets - 1) {
      setTimer(ex.rest_seconds);
      setActiveSetIndex(activeSetIndex + 1);
    } else if (activeExerciseIndex < updatedExercises.length - 1) {
      setActiveExerciseIndex(activeExerciseIndex + 1);
      setActiveSetIndex(0);
      setTimer(null);
    } else {
      alert("Workout Complete! Saving...");
      markWorkoutComplete();
    }
  };

  const saveWorkoutLogs = async () => {
    if (!user || !workout) return;
    // Batch insert (no .map on possibly undefined)
    const insertPayload = (workout.exercises ?? []).map((ex) => ({
      user_id: user.id,
      workout_id: workout.id,
      exercise_name: ex.name,
      sets: Array.isArray(ex.userSets)
        ? ex.userSets.map((s) => ({
            reps: s.reps,
            weight: s.weight,
            completed: !!s.completed,
          }))
        : [],
      personal_record: false,
      created_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("exercise_logs").insert(insertPayload);
    if (error) {
      console.error("Error saving logs:", error);
      alert("Error saving log. Please try again.");
    }
  };

  const markWorkoutComplete = async () => {
    await saveWorkoutLogs();
    await supabase
      .from("workouts")
      .update({ completed: true })
      .eq("id", workoutId);
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading workout...
      </div>
    );
  }
  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <p className="mb-4">Workout not found or failed to load.</p>
        <Button onClick={() => navigate(-1)} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  // Defensive: always fallback to safe arrays in all rendering
  const ex = workout.exercises?.[activeExerciseIndex] ?? {};
  const userSets: ExerciseSet[] = Array.isArray(ex.userSets) ? ex.userSets : [];
  const curSet = userSets?.[activeSetIndex] ?? { reps: "", weight: 0, completed: false };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-12 flex flex-col">
      <div className="flex items-center mb-4">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          className="text-orange-500 text-3xl font-bold mr-4"
          aria-label="Go Back"
        >
          ←
        </Button>
        <h1 className="text-xl font-bold flex-1">{workout.title}</h1>
      </div>
      <p className="text-gray-400 text-sm mb-2">{workout.description}</p>
      <p className="text-gray-400 text-sm italic mb-4">
        Estimated duration: {workout.estimated_duration ?? "N/A"} min
      </p>
      <Card className="flex flex-col flex-1 overflow-auto p-4 bg-gray-800">
        <section className="mb-4">
          <h2 className="text-lg font-semibold mb-1">Warm-up</h2>
          <ul className="list-disc list-inside text-gray-300 text-sm">
            {(Array.isArray(workout.warm_up) ? workout.warm_up : []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            Exercise {activeExerciseIndex + 1} of {Array.isArray(workout.exercises) ? workout.exercises.length : 0}
          </h2>
          <h3 className="text-lg font-semibold mb-1">{ex.name}</h3>
          <p className="text-gray-400 text-sm mb-2">
            Set {activeSetIndex + 1} of {ex.sets ?? 0}
          </p>
          <p className="mb-1 text-gray-300 italic">{ex.instructions}</p>
          <p className="mb-4 text-gray-400 italic text-sm">💡 {ex.tips}</p>
          <div className="flex space-x-4 mb-2">
            <label className="flex flex-col flex-1">
              <span className="text-sm text-gray-300 mb-1">Reps</span>
              <input
                type="text"
                placeholder={ex.reps}
                value={curSet.reps}
                onChange={(e) =>
                  handleSetInputChange(
                    activeExerciseIndex,
                    activeSetIndex,
                    "reps",
                    e.target.value
                  )
                }
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 text-center"
              />
            </label>
            <label className="flex flex-col flex-1">
              <span className="text-sm text-gray-300 mb-1">Weight (kg)</span>
              <input
                type="number"
                placeholder="kg"
                value={curSet.weight || ""}
                onChange={(e) =>
                  handleSetInputChange(
                    activeExerciseIndex,
                    activeSetIndex,
                    "weight",
                    e.target.value
                  )
                }
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 text-center"
                step="0.5"
                min={0}
              />
            </label>
          </div>
          <Button
            onClick={handleCompleteSet}
            variant="primary"
            className="w-full py-3"
          >
            Mark Set as Completed
          </Button>
          {timer !== null && timer > 0 && (
            <p className="mt-2 text-center text-orange-400 text-lg font-mono">
              Rest Timer: {timer} sec
            </p>
          )}
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-1">Cool-down</h2>
          <ul className="list-disc list-inside text-gray-300 text-sm">
            {(Array.isArray(workout.cool_down) ? workout.cool_down : []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
        {activeExerciseIndex === (Array.isArray(workout.exercises) ? workout.exercises.length - 1 : -1) &&
          activeSetIndex === (ex.sets ?? 1) - 1 && (
            <Button
              onClick={markWorkoutComplete}
              variant="secondary"
              className="mt-6 w-full py-3"
            >
              Finish Workout
            </Button>
          )}
      </Card>
    </div>
  );
};

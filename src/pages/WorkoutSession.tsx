import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface Exercise {
  name: string;
  reps: string;
  sets: number;
  rest_seconds: number;
  instructions: string;
  tips: string;
  muscle_groups: string[];
  difficulty: string;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  warm_up: string[];
  cool_down: string[];
  estimated_duration: number | null;
  completed: boolean;
  date: string;
}

interface SetLog {
  reps: string;
  weight: number;
  completed: boolean;
}

export const WorkoutSession: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Logs keyed by exercise name, each is array of SetLog
  const [logs, setLogs] = useState<Record<string, SetLog[]>>({});

  // Timer for rest between sets
  const [timer, setTimer] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch workout & initialize logs
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

        // Parse exercises safely
        let exercises: Exercise[] = [];
        if (Array.isArray(data.exercises)) exercises = data.exercises;
        else if (typeof data.exercises === "string") {
          try {
            const parsed = JSON.parse(data.exercises);
            if (Array.isArray(parsed)) exercises = parsed;
          } catch {
            // fallback empty
          }
        }

        setWorkout({
          id: data.id,
          title: data.title || "Workout",
          description: data.description || "",
          exercises,
          warm_up: data.warm_up || [],
          cool_down: data.cool_down || [],
          estimated_duration: data.estimated_duration ?? null,
          completed: data.completed,
          date: data.date,
        });

        // Initialize empty logs for all exercises
        const initialLogs: Record<string, SetLog[]> = {};
        exercises.forEach((ex) => {
          initialLogs[ex.name] = Array(ex.sets)
            .fill(null)
            .map(() => ({ reps: "", weight: 0, completed: false }));
        });
        setLogs(initialLogs);
      } catch {
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [user, workoutId]);

  // Timer effect for rest periods
  useEffect(() => {
    if (timer === null) return;

    if (timer <= 0) {
      clearInterval(timerRef.current!);
      setTimer(null);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [timer]);

  const currentExercise = workout?.exercises?.[currentExerciseIndex];
  const currentExerciseLogs = currentExercise ? logs[currentExercise.name] : [];
  const currentSetLog = currentExerciseLogs?.[currentSetIndex];

  const updateLog = (field: keyof SetLog, value: string | number | boolean) => {
    if (!currentExercise) return;

    setLogs((prev) => {
      const exerciseLogs = [...(prev[currentExercise.name] || [])];
      const currentLog = exerciseLogs[currentSetIndex] || {
        reps: "",
        weight: 0,
        completed: false,
      };

      let updatedLog = currentLog;

      if (field === "weight" && typeof value === "number") {
        updatedLog = { ...currentLog, weight: value };
      } else if (field === "reps" && typeof value === "string") {
        updatedLog = { ...currentLog, reps: value };
      } else if (field === "completed" && typeof value === "boolean") {
        updatedLog = { ...currentLog, completed: value };
      }
      exerciseLogs[currentSetIndex] = updatedLog;

      return { ...prev, [currentExercise.name]: exerciseLogs };
    });
  };

  // Progresses to next set or exercise, or triggers completion
  const handleCompleteSet = () => {
    if (!currentSetLog) {
      alert("Please enter reps and weight before completing the set.");
      return;
    }
    if (!currentSetLog.reps || currentSetLog.reps.trim() === "" || !currentSetLog.weight) {
      alert("Reps and weight are required.");
      return;
    }

    updateLog("completed", true);

    if (currentSetIndex < (currentExercise!.sets - 1)) {
      setTimer(currentExercise!.rest_seconds);
      setCurrentSetIndex(currentSetIndex + 1);
    } else if (currentExerciseIndex < (workout!.exercises.length - 1)) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      setTimer(null);
    } else {
      alert("Workout completed! Saving data...");
      handleFinishWorkout();
    }
  };

  // Save logs to DB then mark workout completed
  const handleFinishWorkout = async () => {
    if (!workout || !user) return;

    const insertPayload = Object.entries(logs).map(([exercise_name, exerciseLogs]) => ({
      user_id: user.id,
      workout_id: workout.id,
      exercise_name,
      sets: exerciseLogs,
      personal_record: false,
      created_at: new Date().toISOString(),
    }));

    try {
      const { error } = await supabase.from("exercise_logs").insert(insertPayload);
      if (error) {
        console.error("Failed to save exercise logs:", error);
        alert("Error saving logs. Please try again.");
        return;
      }

      const { error: updateError } = await supabase
        .from("workouts")
        .update({ completed: true })
        .eq("id", workout.id);

      if (updateError) {
        console.error("Failed to mark workout completed:", updateError);
        alert("Error updating workout status.");
        return;
      }

      alert("Workout saved successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error occurred.");
    }
  };

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  if (!workout)
    return (
      <div className="p-4 text-white">
        <p>Workout not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  if (!currentExercise)
    return (
      <div className="p-4 text-white">
        <p>Current exercise not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <div className="flex items-center mb-4">
        <Button onClick={() => navigate(-1)} variant="secondary" aria-label="Back" className="mr-4">
          ←
        </Button>
        <h1 className="flex-grow text-2xl font-semibold">{workout.title}</h1>
      </div>

      <p className="mb-2 text-gray-400">{workout.description}</p>
      <p className="mb-6 italic text-gray-400">
        Estimated duration: {workout.estimated_duration ?? "N/A"} minutes
      </p>

      <Card className="flex-grow overflow-auto p-4 bg-gray-800">
        <section className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Warm-up</h2>
          <ul className="mb-6 list-disc list-inside text-sm text-gray-400">
            {workout.warm_up.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          <h2 className="mb-2 text-xl font-semibold">
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </h2>
          <h3 className="mb-2 text-lg font-semibold">{currentExercise.name}</h3>
          <p className="mb-2 text-sm text-gray-400">
            Set {currentSetIndex + 1} of {currentExercise.sets}
          </p>
          <p className="mb-2 italic text-gray-500">{currentExercise.instructions}</p>
          <p className="mb-4 italic text-gray-500">{currentExercise.tips}</p>

          <div className="mb-4 flex gap-4">
            <div className="flex-grow">
              <label htmlFor="reps" className="block mb-1 text-sm text-gray-300">
                Reps
              </label>
              <input
                id="reps"
                type="text"
                inputMode="numeric"
                value={logs[currentExercise.name]?.[currentSetIndex]?.reps || ""}
                onChange={(e) => updateLog("reps", e.target.value)}
                className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-white focus:outline-none"
              />
            </div>

            <div className="flex-grow">
              <label htmlFor="weight" className="block mb-1 text-sm text-gray-300">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                min={0}
                step={0.5}
                inputMode="decimal"
                value={logs[currentExercise.name]?.[currentSetIndex]?.weight || ""}
                onChange={(e) => updateLog("weight", Number(e.target.value))}
                className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-white focus:outline-none"
              />
            </div>
          </div>

          <Button onClick={handleCompleteSet} variant="primary" block>
            Mark Set Completed
          </Button>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Cool-down</h2>
          <ul className="list-disc list-inside text-sm text-gray-400">
            {workout.cool_down.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        {currentExerciseIndex === workout.exercises.length - 1 &&
          currentSetIndex === currentExercise.sets - 1 && (
            <Button onClick={handleFinishWorkout} variant="secondary" block className="mt-6">
              Finish Workout
            </Button>
          )}
      </Card>

      {timer !== null && (
        <div className="fixed bottom-20 inset-x-0 text-center text-orange-400 text-xl font-mono">
          Rest Timer: {timer} sec
        </div>
      )}
    </div>
  );
};

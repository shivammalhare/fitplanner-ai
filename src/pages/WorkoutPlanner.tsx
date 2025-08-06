import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  notes?: string;
}

interface Workout {
  id: string;
  user_id: string;
  date: string;
  muscle_groups: string[];
  exercises: Exercise[];
  completed: boolean;
  goal: string;
  notes: string | null;
}

type ViewMode = "split" | "goal";

export const WorkoutPlanner: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapWorkoutId, setSwapWorkoutId] = useState<string | null>(null);
  const [swapExerciseIndex, setSwapExerciseIndex] = useState<number | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<Exercise[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);

  // Get current week's Mon-Sun dates
  const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const monday = getMonday(new Date());
  const weekDates: string[] = Array(7)
    .fill(0)
    .map((_, i) => new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10));

  useEffect(() => {
    if (!user) return;

    const fetchWorkouts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", weekDates[0])
        .lte("date", weekDates[6])
        .order("date");
      if (error) {
        setWorkouts([]);
      } else {
        setWorkouts(
          (data || []).map((w) => ({
            ...w,
            muscle_groups: Array.isArray(w.muscle_groups) ? w.muscle_groups : [],
            exercises:
              typeof w.exercises === "string"
                ? JSON.parse(w.exercises)
                : w.exercises || [],
          }))
        );
      }
      setLoading(false);
    };
    fetchWorkouts();
  }, [user]);

  const allMuscleGroups = Array.from(new Set(workouts.flatMap((w) => w.muscle_groups ?? [])));
  const allGoals = Array.from(new Set(workouts.map((w) => w.goal)));

  let filteredWorkouts = workouts;
  if (viewMode === "split" && selectedMuscleGroup) {
    filteredWorkouts = filteredWorkouts.filter((w) =>
      w.muscle_groups?.includes(selectedMuscleGroup)
    );
  }
  if (viewMode === "goal" && selectedGoal) {
    filteredWorkouts = filteredWorkouts.filter((w) => w.goal === selectedGoal);
  }

  const workoutsByDate: Record<string, Workout[]> = {};
  for (const date of weekDates) {
    workoutsByDate[date] = filteredWorkouts.filter((w) => w.date === date);
  }

  // Open swap modal and load alternatives
  async function handleSwapWorkout(workoutId: string, exIdx: number) {
    setSwapWorkoutId(workoutId);
    setSwapExerciseIndex(exIdx);
    setSwapModalOpen(true);
    setLoadingAlternatives(true);

    try {
      // Fetch all unique exercises from user's workouts in the week as alternatives
      const { data } = await supabase
        .from("workouts")
        .select("exercises")
        .eq("user_id", user!.id)
        .gte("date", weekDates[0])
        .lte("date", weekDates[6])
        .order("date");

      let allExercises: Exercise[] = [];

      (data || []).forEach((w: any) => {
        let exercisesList: Exercise[] = [];
        if (typeof w.exercises === "string") {
          exercisesList = JSON.parse(w.exercises);
        } else if (Array.isArray(w.exercises)) {
          exercisesList = w.exercises;
        }
        exercisesList.forEach((ex) => {
          if (!allExercises.find((a) => a.name === ex.name)) {
            allExercises.push(ex);
          }
        });
      });

      // Remove the current exercise from alternatives, if possible
      const workout = workouts.find((w) => w.id === workoutId);
      const currentExerciseName = workout?.exercises?.[exIdx]?.name;

      if (currentExerciseName) {
        allExercises = allExercises.filter((ex) => ex.name !== currentExerciseName);
      }

      setSwapAlternatives(allExercises);
    } catch {
      setSwapAlternatives([]);
    }

    setLoadingAlternatives(false);
  }

  // Perform swap: update DB and UI
  async function performSwap(alternative: Exercise) {
    if (!swapWorkoutId || swapExerciseIndex === null) return;

    const workout = workouts.find((w) => w.id === swapWorkoutId);
    if (!workout) return;

    const newExercises = workout.exercises.map((ex, idx) =>
      idx === swapExerciseIndex ? { ...alternative } : ex
    );

    const { error } = await supabase
      .from("workouts")
      .update({ exercises: newExercises })
      .eq("id", workout.id);

    if (!error) {
      setWorkouts((ws) =>
        ws.map((w) =>
          w.id === workout.id
            ? { ...w, exercises: newExercises }
            : w
        )
      );
      setSwapModalOpen(false);
    } else {
      alert("Failed to swap exercise. Please try again.");
    }
  }

  function handleAskCoach() {
    alert("Ask Coach AI (Coming soon!)");
  }

  // Modal component inline (for swap)
  const SwapModal = () => {
    if (!swapModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
          <button
            className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-orange-500"
            onClick={() => setSwapModalOpen(false)}
            aria-label="Close swap modal"
          >
            &times;
          </button>
          <h2 className="text-xl font-bold text-white mb-4">Swap Exercise</h2>
          {loadingAlternatives ? (
            <p className="text-orange-400 text-center">Loading alternatives...</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {swapAlternatives.length === 0 && (
                <p className="text-gray-400 text-center">No alternatives available</p>
              )}
              {swapAlternatives.map((alt, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 rounded-md bg-gray-800 text-white hover:bg-orange-600 transition"
                  onClick={() => performSwap(alt)}
                >
                  <div className="font-semibold">{alt.name}</div>
                  <div className="text-orange-300">{`${alt.sets} x ${alt.reps}`}{alt.weight ? ` @${alt.weight}kg` : ""}</div>
                  {alt.notes && <div className="text-xs italic text-orange-400">Tip: {alt.notes}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-14">
          <h1 className="text-white text-3xl font-extrabold font-sans whitespace-nowrap">
            Workout Planner
          </h1>
        </div>
      </nav>

      {/* Toggle Buttons below Navbar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-800 shadow">
        <div className="max-w-4xl mx-auto flex justify-center p-2 space-x-2">
          <button
            onClick={() => setViewMode("split")}
            className={`px-5 py-1 rounded-l-full text-sm font-semibold transition-colors duration-200 ${
              viewMode === "split"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-800 text-orange-300 hover:text-white"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode("goal")}
            className={`px-5 py-1 rounded-r-full text-sm font-semibold transition-colors duration-200 ${
              viewMode === "goal"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-800 text-orange-300 hover:text-white"
            }`}
          >
            Goal View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 max-w-4xl mx-auto px-4 pb-32">
        {loading ? (
          <p className="text-center text-white">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <p className="text-center text-white">No workouts scheduled this week</p>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-6">
              {viewMode === "split" && (
                <div>
                  <label className="mr-3 font-semibold text-orange-400">Muscle Group:</label>
                  <select
                    value={selectedMuscleGroup || ""}
                    onChange={(e) => setSelectedMuscleGroup(e.target.value || null)}
                    className="rounded-lg px-3 py-1 bg-gray-800 text-orange-200 border border-orange-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All</option>
                    {allMuscleGroups.map((mg) => (
                      <option key={mg} value={mg}>
                        {mg.charAt(0).toUpperCase() + mg.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {viewMode === "goal" && (
                <div>
                  <label className="mr-3 font-semibold text-orange-400">Goal:</label>
                  <select
                    value={selectedGoal || ""}
                    onChange={(e) => setSelectedGoal(e.target.value || null)}
                    className="rounded-lg px-3 py-1 bg-gray-800 text-orange-200 border border-orange-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All</option>
                    {allGoals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal.charAt(0).toUpperCase() + goal.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Weekly planner cards */}
            {weekDates.map((date) => (
              <div key={date} className="mb-8">
                <h2 className="text-lg md:text-xl font-semibold text-orange-400 mb-3 ml-3">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h2>
                {(workoutsByDate[date]?.length || 0) === 0 ? (
                  <p className="italic text-gray-500 ml-4">Rest day or no workout planned.</p>
                ) : (
                  <div className="bg-gray-800/90 rounded-2xl p-5 shadow-lg">
                    {workoutsByDate[date].map((workout) => (
                      <div className="mb-4" key={workout.id}>
                        <div className="flex flex-wrap items-center text-white/90 font-semibold mb-3">
                          <span className="text-xl capitalize mr-3">{workout.muscle_groups?.join(", ")}</span>
                          {workout.completed && (
                            <span className="mr-3 px-2 py-0.5 rounded bg-green-700 text-white text-xs">Completed</span>
                          )}
                          <span className="italic text-orange-300 text-sm">{workout.goal && `(${workout.goal.replace('_', ' ')})`}</span>
                        </div>
                        <ul className="space-y-3">
                          {workout.exercises.map((ex, exIdx) => (
                            <li
                              key={exIdx}
                              className="flex justify-between items-center rounded-md bg-black/30 px-3 py-2 hover:bg-gray-700/80 transition"
                            >
                              <div>
                                <span className="font-semibold text-white">{ex.name}</span>
                                <span className="ml-2 text-orange-300">{`- ${ex.sets} x ${ex.reps}`}{ex.weight ? ` @${ex.weight}kg` : ""}</span>
                                {ex.notes && (
                                  <div className="italic text-xs text-orange-400">Tip: {ex.notes}</div>
                                )}
                              </div>
                              <Button size="sm" variant="secondary" onClick={() => handleSwapWorkout(workout.id, exIdx)}>
                                Swap
                              </Button>
                            </li>
                          ))}
                        </ul>
                        {workout.notes && (
                          <div className="mt-2 italic lowercase px-2 py-1 bg-gray-700 text-gray-400 text-sm rounded-md">Notes: {workout.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AI Coach Button */}
            <div className="fixed z-50 right-6 bottom-20 md:bottom-24 shadow-xl">
              <Button
                variant="primary"
                size="sm"
                className="rounded-full px-7 py-3 text-lg font-bold animate-pulse bg-gradient-to-r from-orange-400 to-orange-700 shadow-xl border-2 border-orange-100"
                onClick={handleAskCoach}
              >
                💬 AI Coach
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Swap Modal */}
      {swapModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-orange-500"
              onClick={() => setSwapModalOpen(false)}
              aria-label="Close swap modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Swap Exercise</h2>
            {loadingAlternatives ? (
              <p className="text-orange-400 text-center">Loading alternatives...</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {swapAlternatives.length === 0 && (
                  <p className="text-gray-400 text-center">No alternatives available</p>
                )}
                {swapAlternatives.map((alt, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-3 rounded-md bg-gray-800 text-white hover:bg-orange-600 transition"
                    onClick={() => performSwap(alt)}
                  >
                    <div className="font-semibold">{alt.name}</div>
                    <div className="text-orange-300">{`${alt.sets} x ${alt.reps}`}{alt.weight ? ` @${alt.weight}kg` : ""}</div>
                    {alt.notes && <div className="text-xs italic text-orange-400">Tip: {alt.notes}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutPlanner;

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

  function handleSwapWorkout(workoutId: string, exIdx: number) {
    alert(`Swap exercise #${exIdx + 1} in workout: ${workoutId} (Coming soon!)`);
  }

  function handleAskCoach() {
    alert("Ask Coach AI (Coming soon!)");
  }

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
      <div className="fixed top-14 left-0 right-0 z-40  border-gray-800 shadow">
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
      {/* Footer */}
    </>
        
  );
};

export default WorkoutPlanner;

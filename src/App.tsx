import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import { HexColorPicker } from "react-colorful";

const DEFAULT_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#84CC16", // Lime
];

function ColorPicker({ selectedColor, onColorChange }: { selectedColor: string, onColorChange: (color: string) => void }) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => {
              onColorChange(color);
              setShowColorPicker(false);
            }}
            className={`w-8 h-8 rounded-full ${
              selectedColor === color ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
            showColorPicker ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900" : ""
          }`}
        >
          <span className="text-lg">🎨</span>
        </button>
      </div>
      
      {showColorPicker && (
        <div className="relative">
          <HexColorPicker
            color={selectedColor}
            onChange={(color) => {
              onColorChange(color);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold accent-text">Habit Tracker</h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster theme="system" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const habits = useQuery(api.habits.list);
  const createHabit = useMutation(api.habits.create);
  const updateHabit = useMutation(api.habits.update);
  const toggleCompletion = useMutation(api.habits.toggleCompletion);
  const toggleEditMode = useMutation(api.habits.toggleEditMode);
  
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [targetDays, setTargetDays] = useState(1);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [editingHabit, setEditingHabit] = useState<Id<"habits"> | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const last90Days = [...Array(90)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const completions = useQuery(api.habits.getCompletions, {
    startDate: last90Days[0],
    endDate: last90Days[last90Days.length - 1],
  });

  if (loggedInUser === undefined || habits === undefined || completions === undefined) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>;
  }

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHabit({
        name: newHabitName,
        description: newHabitDesc,
        targetDaysPerWeek: targetDays,
        color: selectedColor,
      });
      setShowNewHabitForm(false);
      setNewHabitName("");
      setNewHabitDesc("");
      setTargetDays(1);
      setSelectedColor(DEFAULT_COLORS[0]);
      toast.success("Habit created!");
    } catch (error) {
      toast.error("Failed to create habit");
    }
  };

  const handleUpdateHabit = async (habit: any) => {
    try {
      await updateHabit({
        habitId: habit._id,
        name: newHabitName,
        description: newHabitDesc,
        targetDaysPerWeek: targetDays,
        color: selectedColor,
      });
      setEditingHabit(null);
      setNewHabitName("");
      setNewHabitDesc("");
      setTargetDays(1);
      setSelectedColor(DEFAULT_COLORS[0]);
      toast.success("Habit updated!");
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const handleToggle = async (habitId: Id<"habits">, date: string) => {
    try {
      await toggleCompletion({ habitId, date });
    } catch (error) {
      toast.error("Failed to update habit");
    }
  };

  const handleEditModeToggle = async (habitId: Id<"habits">) => {
    try {
      await toggleEditMode({ habitId });
    } catch (error) {
      toast.error("Failed to toggle edit mode");
    }
  };

  const completionsByDate = completions.reduce((acc, completion) => {
    acc[`${completion.habitId}-${completion.date}`] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const startEditing = (habit: any) => {
    setEditingHabit(habit._id);
    setNewHabitName(habit.name);
    setNewHabitDesc(habit.description || "");
    setTargetDays(habit.targetDaysPerWeek);
    setSelectedColor(habit.color || DEFAULT_COLORS[0]);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Habit Tracker</h1>
        <Authenticated>
          <p className="text-xl text-slate-600 dark:text-slate-300">Track your progress, {loggedInUser?.email ?? "friend"}!</p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600 dark:text-slate-300">Sign in to track your habits</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Habits</h2>
            <button
              onClick={() => setShowNewHabitForm(!showNewHabitForm)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              {showNewHabitForm ? "Cancel" : "New Habit"}
            </button>
          </div>

          {showNewHabitForm && (
            <form onSubmit={handleCreateHabit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                <input
                  type="text"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Days per Week</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Create Habit
              </button>
            </form>
          )}

          <div className="space-y-4">
            {habits.map((habit) => (
              <div key={habit._id} className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-800">
                {editingHabit === habit._id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateHabit(habit); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                      <input
                        type="text"
                        value={newHabitDesc}
                        onChange={(e) => setNewHabitDesc(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Days per Week</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={targetDays}
                        onChange={(e) => setTargetDays(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                      <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHabit(null)}
                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-gray-600 dark:text-gray-300">{habit.description}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Target: {habit.targetDaysPerWeek} days/week
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {completionsByDate[`${habit._id}-${today}`] ? (
                          <button
                            onClick={() => handleToggle(habit._id, today)}
                            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Undo Today
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggle(habit._id, today)}
                            className="px-3 py-1 rounded text-white"
                            style={{ backgroundColor: habit.color }}
                          >
                            Done Today
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(habit)}
                          className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleEditModeToggle(habit._id)}
                          className={`px-3 py-1 rounded ${
                            habit.editMode
                              ? "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                              : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {habit.editMode ? "Editing" : "View"}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {last90Days.map((date) => {
                        const isCompleted = completionsByDate[`${habit._id}-${date}`];
                        const isToday = date === today;
                        return (
                          <button
                            key={date}
                            onClick={() => handleToggle(habit._id, date)}
                            className={`w-4 h-4 rounded-sm transition-colors ${
                              isCompleted
                                ? "hover:opacity-75"
                                : "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                            } ${isToday ? "ring-2 ring-indigo-500 dark:ring-indigo-400" : ""}`}
                            style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                            title={`${date}${isCompleted ? " - Completed" : ""}`}
                            disabled={!habit.editMode && date !== today}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

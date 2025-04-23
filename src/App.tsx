import HabitTracker from "./components/habit-tracker";

function App() {
  return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Habit Tracker</h1>
          <HabitTracker />
        </div>
      </main>
  
  )
}

export default App


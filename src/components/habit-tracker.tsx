"use client"

import { useState, useEffect } from "react"
import HabitForm from "./habit-form"
import HabitList from "./habit-list"
import PerformanceGraph from "./performance-graph"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export type Habit = {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly"
  completedDates: string[] // ISO date strings
  color: string
  createdAt: string
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    // Load habits from localStorage if available
    if (typeof window !== "undefined") {
      const savedHabits = localStorage.getItem("habits")
      return savedHabits ? JSON.parse(savedHabits) : []
    }
    return []
  })

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    }
    setHabits((prev) => [...prev, newHabit])
  }

  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)))
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit

        const completedDates = [...habit.completedDates]
        // Normalize the date format for comparison
        const normalizedDate = date.includes("T") ? date : `${date}T00:00:00.000Z`

        // Find if this date (ignoring time) is already in the completedDates
        const existingIndex = completedDates.findIndex((d) => d.split("T")[0] === normalizedDate.split("T")[0])

        if (existingIndex === -1) {
          completedDates.push(normalizedDate)
        } else {
          completedDates.splice(existingIndex, 1)
        }

        return {
          ...habit,
          completedDates,
        }
      }),
    )
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="hover:cursor-pointer">Habits</TabsTrigger>
          <TabsTrigger value="stats" className="hover:cursor-pointer">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-6">
          <HabitForm onAddHabit={addHabit} />
          <HabitList
            habits={habits}
            onToggleCompletion={toggleHabitCompletion}
            onUpdateHabit={updateHabit}
            onDeleteHabit={deleteHabit}
          />
        </TabsContent>
        <TabsContent value="stats">
          <PerformanceGraph habits={habits} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


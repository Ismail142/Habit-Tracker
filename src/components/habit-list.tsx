"use client"

import { useState } from "react"
import { format, subDays, startOfWeek, addDays } from "date-fns"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Check, Edit, Trash2 } from "lucide-react"
import HabitForm from "./habit-form"
import type { Habit } from "./habit-tracker"

type HabitListProps = {
  habits: Habit[]
  onToggleCompletion: (habitId: string, date: string) => void
  onUpdateHabit: (habit: Habit) => void
  onDeleteHabit: (id: string) => void
}

export default function HabitList({ habits, onToggleCompletion, onUpdateHabit, onDeleteHabit }: HabitListProps) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const today = new Date()

  // Generate last 7 days for daily habits
  const dailyDates = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse()

  // Generate current week days for weekly habits
  const weekStart = startOfWeek(today)
  const weeklyDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
  }

  const handleUpdateHabit = (updatedHabitData: Omit<Habit, "id" | "createdAt" | "completedDates">) => {
    if (editingHabit) {
      onUpdateHabit({
        ...editingHabit,
        ...updatedHabitData,
      })
      setEditingHabit(null)
    }
  }

  const isHabitCompletedOnDate = (habit: Habit, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return habit.completedDates.some((completedDate) => format(new Date(completedDate), "yyyy-MM-dd") === dateString)
  }

  const toggleCompletion = (habit: Habit, date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    onToggleCompletion(habit.id, dateString)
  }

  if (habits.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No habits added yet. Add your first habit above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <Card key={habit.id} className="overflow-hidden">
          <CardHeader className={`${habit.color} text-white`}>
            <div className="flex justify-between items-center">
              <CardTitle>{habit.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditHabit(habit)}
                  className="text-white hover:bg-white/20"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteHabit(habit.id)}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {habit.description && <p className="text-sm opacity-90">{habit.description}</p>}
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{habit.frequency === "daily" ? "Daily" : "Weekly"} habit</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {format(new Date(habit.createdAt), "MMM d, yyyy")}
              </p>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-7 gap-2">
                {(habit.frequency === "daily" ? dailyDates : weeklyDates).map((date) => (
                  <div key={date.toISOString()} className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">{format(date, "EEE")}</span>
                    <span className="text-xs text-gray-500 mb-2">{format(date, "d")}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-full h-8 w-8 ${
                        isHabitCompletedOnDate(habit, date)
                          ? `${habit.color} text-white`
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                      onClick={() => toggleCompletion(habit, date)}
                    >
                      {isHabitCompletedOnDate(habit, date) && <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          {editingHabit && (
            <HabitForm
              onAddHabit={handleUpdateHabit}
              initialValues={{
                name: editingHabit.name,
                description: editingHabit.description,
                frequency: editingHabit.frequency,
                color: editingHabit.color,
              }}
              buttonText="Update Habit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import type { Habit } from "./habit-tracker"

const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

type HabitFormProps = {
  onAddHabit: (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => void
  initialValues?: Omit<Habit, "id" | "createdAt" | "completedDates">
  buttonText?: string
}

export default function HabitForm({ onAddHabit, initialValues, buttonText = "Add Habit" }: HabitFormProps) {
  const [name, setName] = useState(initialValues?.name || "")
  const [description, setDescription] = useState(initialValues?.description || "")
  const [frequency, setFrequency] = useState<"daily" | "weekly">(initialValues?.frequency || "daily")
  const [color, setColor] = useState(initialValues?.color || COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAddHabit({
      name,
      description,
      frequency,
      color,
    })

    // Reset form if it's an add form (not edit)
    if (!initialValues) {
      setName("")
      setDescription("")
      setFrequency("daily")
      setColor(COLORS[0])
    }
  }

  // onValueChange={(value: "daily" | "weekly")

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter habit name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={(value: "daily" | "weekly") => setFrequency(value)}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              {/* <SelectItem value="weekly">Weekly</SelectItem> */}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                className={`w-8 h-8 rounded-full ${colorOption} ${
                  color === colorOption ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""
                }`}
                onClick={() => setColor(colorOption)}
                aria-label={`Select ${colorOption} color`}
              />
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {buttonText}
      </Button>
    </form>
  )
}


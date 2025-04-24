"use client"

import { useState } from "react"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { Calendar, Flame, TrendingUp } from "lucide-react"
import type { Habit } from "./habit-tracker"

type PerformanceGraphProps = {
  habits: Habit[]
}

// Custom gradient colors for charts
const GRADIENT_COLORS = [
  ["#6366f1", "#a855f7"], // Indigo to Purple
  ["#ec4899", "#f43f5e"], // Pink to Rose
  ["#06b6d4", "#3b82f6"], // Cyan to Blue
  ["#84cc16", "#10b981"], // Lime to Emerald
  ["#f97316", "#eab308"], // Orange to Yellow
]

export default function PerformanceGraph({ habits }: PerformanceGraphProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "month">("30days")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [chartType, setChartType] = useState<"bar" | "area" | "summary">("bar")

  const today = new Date();

  // Generate date range based on selected time range
  let dateRange: Date[]
  if (timeRange === "7days") {
    dateRange = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))
  } else if (timeRange === "30days") {
    dateRange = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i))
  } else {
    // Month view
    const [year, month] = selectedMonth.split("-").map(Number)
    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(monthStart)
    dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd })
  }

  // Calculate completion rate for each habit on each day
  const chartData = dateRange.map((date) => {
    const dataPoint: any = {
      date: format(date, "MMM dd"),
      fullDate: date,
    }

    // For stacked bar chart - count total completed habits per day
    let totalCompleted = 0

    habits.forEach((habit) => {
      const isCompleted = habit.completedDates.some((completedDate) => isSameDay(new Date(completedDate), date))
      dataPoint[habit.id] = isCompleted ? 1 : 0
      if (isCompleted) totalCompleted++
    })

    dataPoint.totalCompleted = totalCompleted
    dataPoint.completionRate = habits.length > 0 ? (totalCompleted / habits.length) * 100 : 0

    return dataPoint
  })

  // Calculate overall completion rate for each habit
  const habitStats = habits.map((habit, index) => {
    const totalDays = dateRange.length
    const completedDays = dateRange.filter((date) =>
      habit.completedDates.some((completedDate) => isSameDay(new Date(completedDate), date)),
    ).length

    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

    // Calculate current streak
    let currentStreak = 0
    const sortedDates = [...habit.completedDates]
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime()) // Sort descending

    let checkDate = today
    for (const date of sortedDates) {
      if (isSameDay(date, checkDate)) {
        currentStreak++
        checkDate = new Date(checkDate.setDate(checkDate.getDate() - 1))
      } else if (date < checkDate) {
        // Skip ahead to this date
        checkDate = date
        currentStreak++
        checkDate = new Date(checkDate.setDate(checkDate.getDate() - 1))
      } else {
        // Gap found
        break
      }
    }

    // Assign gradient colors
    const colorIndex = index % GRADIENT_COLORS.length
    const gradientStart = GRADIENT_COLORS[colorIndex][0]
    const gradientEnd = GRADIENT_COLORS[colorIndex][1]

    return {
      ...habit,
      completionRate,
      completedDays,
      totalDays,
      currentStreak,
      gradientStart,
      gradientEnd,
    }
  })

  // Prepare data for pie chart
  const overallStats = {
    totalHabits: habits.length,
    totalDays: dateRange.length,
    totalPossibleCompletions: habits.length * dateRange.length,
    totalCompletions: habits.reduce((sum, habit) => {
      return (
        sum +
        habit.completedDates.filter((date) =>
          isWithinInterval(new Date(date), {
            start: dateRange[0],
            end: dateRange[dateRange.length - 1],
          }),
        ).length
      )
    }, 0),
  }

  // Ensure we have valid data for the pie chart (avoid division by zero)
  const completedValue = overallStats.totalCompletions || 0
  const missedValue = Math.max(0, overallStats.totalPossibleCompletions - overallStats.totalCompletions) || 0

  const pieData = [
    { name: "Completed", value: completedValue, color: "#4ade80" },
    { name: "Missed", value: missedValue, color: "#f87171" },
  ].filter((item) => item.value > 0) // Only include non-zero values

  // Prepare data for radial bar chart (streaks)
  const streakData = habitStats
    .map((habit) => ({
      name: habit.name,
      value: habit.currentStreak,
      fill: habit.gradientStart,
    }))
    .sort((a, b) => b.value - a.value)

  // Generate month options for the dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    }
  })

  // Custom pie chart label
  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Habit Performance</CardTitle>
          <CardDescription className="text-base">Track your habit completion over time</CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={timeRange} onValueChange={(value: "7days" | "30days" | "month") => setTimeRange(value)}>
                <SelectTrigger id="timeRange" className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="month">Full Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeRange === "month" && (
              <div className="space-y-2 flex-1">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month" className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                No habits to display. Add habits to see your performance.
              </p>
            </div>
          ) : (
            <>
              <Tabs defaultValue="bar" className="w-full" onValueChange={(value) => setChartType(value as any)}>
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <TabsTrigger
                    value="bar"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Daily View
                  </TabsTrigger>
                  <TabsTrigger
                    value="area"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trends
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Summary
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bar" className="space-y-4">
                  <div className="h-[350px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          {habitStats.map((habit) => (
                            <linearGradient key={habit.id} id={`gradient-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={habit.gradientStart} stopOpacity={1} />
                              <stop offset="100%" stopColor={habit.gradientEnd} stopOpacity={0.8} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value, index) => {
                            return index % (timeRange === "7days" ? 1 : 5) === 0 ? value : ""
                          }}
                          stroke="#9ca3af"
                        />
                        <YAxis
                          domain={[0, 1]}
                          ticks={[0, 1]}
                          stroke="#9ca3af"
                          tickFormatter={(value) => (value === 1 ? "Yes" : "No")}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                  <p className="font-medium mb-2">{label}</p>
                                  {payload.map((entry, index) => {
                                    const habit = habits.find((h) => h.id === entry.dataKey)
                                    if (!habit) return null
                                    return (
                                      <div key={index} className="flex items-center gap-2 mb-1">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            background: `linear-gradient(to right, ${habitStats.find((h) => h.id === habit.id)?.gradientStart}, ${habitStats.find((h) => h.id === habit.id)?.gradientEnd})`,
                                          }}
                                        />
                                        <span className="text-sm">{habit.name}:</span>
                                        <span className="text-sm font-medium">
                                          {entry.value === 1 ? "Completed" : "Not Completed"}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        {habitStats.map((habit) => (
                          <Bar
                            key={habit.id}
                            dataKey={habit.id}
                            name={habit.name}
                            fill={`url(#gradient-${habit.id})`}
                            barSize={timeRange === "7days" ? 30 : 15}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {habitStats.map((habit) => (
                        <div key={habit.id} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${habit.gradientStart}, ${habit.gradientEnd})`,
                            }}
                          />
                          <span className="text-sm font-medium">{habit.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="area" className="space-y-4">
                  <div className="h-[350px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value, index) => {
                            return index % (timeRange === "7days" ? 1 : 5) === 0 ? value : ""
                          }}
                          stroke="#9ca3af"
                        />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#9ca3af" />
                        <Tooltip
                          formatter={(value: any) => [`${value.toFixed(0)}%`, "Completion Rate"]}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="completionRate"
                          name="Completion Rate"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorCompletion)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-sm text-gray-500 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    This chart shows the percentage of habits completed each day over time
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
                      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <CardTitle className="text-lg">Overall Completion</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-[200px]">
                          {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={renderCustomizedPieLabel}
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [`${value} times`, "Frequency"]}
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500">No completion data available</p>
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium">
                            Overall completion rate:{" "}
                            {overallStats.totalPossibleCompletions > 0
                              ? ((overallStats.totalCompletions / overallStats.totalPossibleCompletions) * 100).toFixed(
                                  1,
                                )
                              : 0}
                            %
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
                      <CardHeader className="pb-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                        <CardTitle className="text-lg">Current Streaks</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="h-[200px]">
                          {streakData.length > 0 && streakData.some((d) => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="20%"
                                outerRadius="80%"
                                barSize={10}
                                data={streakData}
                                startAngle={180}
                                endAngle={0}
                              >
                                <RadialBar
                                  label={{ fill: "#666", position: "insideStart" }}
                                  background
                                  dataKey="value"
                                  animationDuration={1500}
                                />
                                <Tooltip
                                  formatter={(value) => [`${value} days`, "Current Streak"]}
                                  contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                              </RadialBarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500">No streak data available</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {habitStats.map((habit) => (
                  <Card
                    key={habit.id}
                    className="overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <CardHeader
                      className="py-3 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${habit.gradientStart}, ${habit.gradientEnd})`,
                        color: "white",
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-10 rounded-full scale-150 translate-x-1/2 -translate-y-1/2"></div>
                      <CardTitle className="text-base relative z-10">{habit.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                          <p className="text-2xl font-bold" style={{ color: habit.gradientStart }}>
                            {habit.completionRate.toFixed(0)}%
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                          <p className="text-2xl font-bold" style={{ color: habit.gradientEnd }}>
                            {habit.currentStreak}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Completed Days:</span>
                          <span className="font-medium">
                            {habit.completedDays} / {habit.totalDays}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${habit.completionRate}%`,
                            background: `linear-gradient(to right, ${habit.gradientStart}, ${habit.gradientEnd})`,
                          }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { BarChart3 } from "lucide-react"
import type { Task } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ProgressPageProps {
  tasks: Task[]
}

export function ProgressPage({ tasks }: ProgressPageProps) {
  const chartData = useMemo(() => {
    // Generate last 30 days
    const today = new Date()
    const thirtyDaysData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      thirtyDaysData.push(date)
    }

    // Count completed tasks per day
    const tasksPerDay = thirtyDaysData.map((date) => {
      const dateStr = date.toISOString().split("T")[0]
      const completedCount = tasks.filter(
        (task) => task.status === "completed" && task.dueDate === dateStr
      ).length
      
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        tasks: completedCount,
        fullDate: dateStr,
      }
    })

    return tasksPerDay
  }, [tasks])

  const totalCompleted = tasks.filter((t) => t.status === "completed").length
  const averagePerDay = chartData.length > 0 ? Math.round(totalCompleted / 30) : 0
  const maxDay = Math.max(...chartData.map((d) => d.tasks), 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Total Completed</p>
          <p className="text-3xl font-bold text-primary">{totalCompleted}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Avg per Day</p>
          <p className="text-3xl font-bold text-primary">{averagePerDay}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Best Day</p>
          <p className="text-3xl font-bold text-primary">{maxDay}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tasks Completed - Last 30 Days</h3>
        </div>
        <div className="p-5">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No task data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  domain={[0, Math.ceil(maxDay * 1.2) || 1]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value) => [value, "Tasks"]}
                />
                <Bar
                  dataKey="tasks"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

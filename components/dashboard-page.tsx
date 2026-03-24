"use client"

import { useState } from "react"
import { CalendarClock, CheckSquare, BarChart3, Users2 } from "lucide-react"
import { OverviewCards } from "@/components/overview-cards"
import { TasksSection } from "@/components/tasks-section"
import { mockTasks, Task } from "@/lib/mock-data"

interface DashboardPageProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  showNotification: (msg: string) => void
}

const quickStats = [
  { label: "Streak", value: "7 days", icon: CalendarClock },
  { label: "Done this week", value: "24 tasks", icon: CheckSquare },
  { label: "Top topic", value: "DSA", icon: BarChart3 },
  { label: "Team rank", value: "#1", icon: Users2 },
]

export function DashboardPage({ tasks, setTasks, showNotification }: DashboardPageProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Date greeting */}
      <div>
        <h2 className="text-lg font-semibold text-foreground text-balance">
          Good morning, Alex
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 bg-secondary/50 border border-border rounded-xl px-4 py-3">
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overview cards */}
      <OverviewCards tasks={tasks} />

      {/* Tasks */}
      <TasksSection tasks={tasks} setTasks={setTasks} showNotification={showNotification} />
    </div>
  )
}

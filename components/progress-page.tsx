"use client"

import { useMemo } from "react"
import { BarChart3 } from "lucide-react"
import type { TeamMember } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ProgressPageProps {
  userId: string
  teamMembers: TeamMember[]
}

export function ProgressPage({ userId, teamMembers }: ProgressPageProps) {
  const chartData = useMemo(() => {
    // Generate last 30 days
    const today = new Date()
    const thirtyDaysData = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      thirtyDaysData.push(date)
    }

    // Count completed tasks per day for each team member
    const tasksPerDay = thirtyDaysData.map((date) => {
      const dateStr = date.toISOString().split("T")[0]
      const data: any = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: dateStr,
      }

      teamMembers.forEach((member) => {
        const completedCount = member.tasks.filter(
          (task) => task.status === "completed" && task.dueDate === dateStr
        ).length
        data[member.id] = completedCount
      })

      return data
    })

    return tasksPerDay
  }, [teamMembers])

  // Calculate stats for each team member
  const memberStats = useMemo(() => {
    return teamMembers.map((member) => {
      const totalCompleted = member.tasks.filter((t) => t.status === "completed").length
      const averagePerDay = Math.round(totalCompleted / 30)
      const maxDay = Math.max(
        ...chartData.map((d) => d[member.id] || 0),
        0
      )
      return {
        member,
        totalCompleted,
        averagePerDay,
        maxDay,
      }
    })
  }, [teamMembers, chartData])

  const colors = ["hsl(var(--primary))", "hsl(196 81% 53%)"]

  const currentUserMember = teamMembers.find((m) => m.id === userId)
  const otherMember = teamMembers.find((m) => m.id !== userId)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {memberStats.map((stat, idx) => {
          const isCurrentUser = stat.member.id === userId
          return (
            <div
              key={stat.member.id}
              className="bg-card border border-border rounded-2xl p-4"
              style={{
                borderColor: `${colors[idx]}40`,
              }}
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.member.name}</p>
              <p className="text-2xl font-bold mb-3" style={{ color: colors[idx] }}>
                {stat.totalCompleted}
              </p>
              <p className="text-xs text-muted-foreground">Total Completed</p>
            </div>
          )
        })}
        {memberStats.map((stat, idx) => (
          <div
            key={`avg-${stat.member.id}`}
            className="bg-card border border-border rounded-2xl p-4"
            style={{
              borderColor: `${colors[idx]}40`,
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.member.name}</p>
            <p className="text-2xl font-bold mb-3" style={{ color: colors[idx] }}>
              {stat.averagePerDay}
            </p>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Team Progress - Last 30 Days</h3>
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
                  domain={[0, Math.max(...memberStats.map((s) => s.maxDay * 1.2)) || 1]}
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
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => {
                    const member = teamMembers.find((m) => m.id === value)
                    return member?.name || value
                  }}
                />
                {teamMembers.map((member, idx) => (
                  <Bar
                    key={member.id}
                    dataKey={member.id}
                    fill={colors[idx]}
                    radius={[8, 8, 0, 0]}
                    animationDuration={500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, Grid3X3, Loader2, Target } from "lucide-react"
import type { TeamMember } from "@/lib/types"
import { getTeamProgressData, type ProgressTask } from "@/lib/dailybrick-api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { cn } from "@/lib/utils"

const PREDEFINED_TOPICS = [
  "Math",
  "AIML",
  "Language",
  "Library",
  "Tool",
  "Skill",
  "Project",
  "Hackathon",
  "Extra",
  "Timepass",
  "Others",
]

interface ProgressPageProps {
  userId: string
  teamMembers: TeamMember[]
}

export function ProgressPage({ userId, teamMembers }: ProgressPageProps) {
  const [historicalData, setHistoricalData] = useState<ProgressTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const userIds = teamMembers.map(m => m.id)
    if (userIds.length === 0) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    getTeamProgressData(userIds).then(data => {
      if (mounted) {
        setHistoricalData(data)
        setLoading(false)
      }
    }).catch(err => {
      console.error(err)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [teamMembers])

  const chartData = useMemo(() => {
    const today = new Date()
    const monthData = []
    
    // Get number of days in current month
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      // Set to noon to avoid timezone shift issues on Date boundaries
      const date = new Date(today.getFullYear(), today.getMonth(), i, 12, 0, 0)
      monthData.push(date)
    }

    const tasksPerDay = monthData.map((date) => {
      const dateStr = date.toISOString().split("T")[0]
      const data: any = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: dateStr,
      }

      teamMembers.forEach((member) => {
        const completedCount = historicalData.filter(
          (task) => task.user_id === member.id && task.due_date === dateStr
        ).length
        data[member.id] = completedCount
      })

      return data
    })

    return tasksPerDay
  }, [teamMembers, historicalData])

  const topicData = useMemo(() => {
    return PREDEFINED_TOPICS.map(topic => {
      const data: any = { topic }
      teamMembers.forEach(member => {
        data[member.id] = historicalData.filter(
          t => t.user_id === member.id && t.topic === topic
        ).length
      })
      // Add total for sorting/filtering
      data.total = teamMembers.reduce((sum, member) => sum + data[member.id], 0)
      return data
    }).filter(d => d.total > 0) // Only show topics that have at least one task
  }, [teamMembers, historicalData])

  const memberStats = useMemo(() => {
    return teamMembers.map((member) => {
      const totalCompleted = historicalData.filter((t) => t.user_id === member.id).length
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
  }, [teamMembers, chartData, historicalData])

  const colors = ["hsl(var(--primary))", "hsl(196 81% 53%)"]

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "long" })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {memberStats.map((stat, idx) => (
          <div
            key={stat.member.id}
            className="bg-card border border-border rounded-2xl p-4"
            style={{ borderColor: `${colors[idx]}40` }}
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.member.name}</p>
            <p className="text-2xl font-bold mb-3" style={{ color: colors[idx] }}>
              {stat.totalCompleted}
            </p>
            <p className="text-xs text-muted-foreground">Total Completed</p>
          </div>
        ))}
        {memberStats.map((stat, idx) => (
          <div
            key={`avg-${stat.member.id}`}
            className="bg-card border border-border rounded-2xl p-4"
            style={{ borderColor: `${colors[idx]}40` }}
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.member.name}</p>
            <p className="text-2xl font-bold mb-3" style={{ color: colors[idx] }}>
              {stat.averagePerDay}
            </p>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
          </div>
        ))}
      </div>

      {/* Topics Matrix */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Topics Matrix - {currentMonthName}</h3>
        </div>
        <div className="p-0 overflow-x-auto">
          {topicData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No topic data yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Topic</th>
                  {teamMembers.map(member => (
                    <th key={member.id} className="px-5 py-3 font-medium text-center">{member.name}</th>
                  ))}
                  <th className="px-5 py-3 font-medium text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topicData.sort((a, b) => b.total - a.total).map(row => (
                  <tr key={row.topic} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{row.topic}</td>
                    {teamMembers.map((member, idx) => (
                      <td key={member.id} className="px-5 py-3 text-center">
                        {row[member.id] > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10" style={{ color: colors[idx] }}>
                            {row[member.id]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3 font-bold text-center text-foreground">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Graph */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Top Topics</h3>
          </div>
          <div className="p-5">
            {topicData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No topic data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicData.sort((a, b) => b.total - a.total).slice(0, 7)} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="topic"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", padding: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: any, name: any) => [
                      value,
                      teamMembers.find((m) => m.id === name)?.name || name
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => teamMembers.find((m) => m.id === value)?.name || value} />
                  {teamMembers.map((member, idx) => (
                    <Bar key={member.id} dataKey={member.id} stackId="a" fill={colors[idx]} animationDuration={500} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{currentMonthName} Overview</h3>
          </div>
          <div className="p-5">
            {chartData.every(d => teamMembers.every(m => d[m.id] === 0)) ? (
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
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", padding: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: any, name: any) => [
                      value,
                      teamMembers.find((m) => m.id === name)?.name || name
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} formatter={(value) => teamMembers.find((m) => m.id === value)?.name || value} />
                  {teamMembers.map((member, idx) => (
                    <Bar key={member.id} dataKey={member.id} fill={colors[idx]} radius={[4, 4, 0, 0]} animationDuration={500} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

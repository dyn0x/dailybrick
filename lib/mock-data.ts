export type TaskStatus = "pending" | "completed"

export interface Task {
  id: string
  title: string
  time: string
  status: TaskStatus
  carriedForward?: boolean
  topic?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatarInitials: string
  completionPercent: number
  tasks: Task[]
  isYou?: boolean
}

export interface TopicProgress {
  id: string
  name: string
  completed: number
  total: number
}

export const mockTasks: Task[] = [
  { id: "1", title: "Review lecture notes on Bayes' Theorem", time: "09:00 AM", status: "completed", topic: "Probability" },
  { id: "2", title: "Solve 5 problems from Chapter 4", time: "10:30 AM", status: "completed", topic: "Probability" },
  { id: "3", title: "Study Linear Regression", time: "12:00 PM", status: "pending", topic: "Statistics" },
  { id: "4", title: "Complete DSA mock test", time: "02:00 PM", status: "pending", topic: "DSA" },
  { id: "5", title: "Read OS scheduling algorithms", time: "04:00 PM", status: "pending", topic: "OS" },
]

export const mockCarriedForwardTasks: Task[] = [
  { id: "cf1", title: "Finish DBMS normalization notes", time: "08:00 AM", status: "pending", carriedForward: true, topic: "DBMS" },
  { id: "cf2", title: "Revise sorting algorithms", time: "09:30 AM", status: "pending", carriedForward: true, topic: "DSA" },
]

export const mockTeamMembers: TeamMember[] = [
  {
    id: "u1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatarInitials: "AJ",
    completionPercent: 72,
    isYou: true,
    tasks: mockTasks,
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@example.com",
    avatarInitials: "PS",
    completionPercent: 85,
    tasks: [
      { id: "t1", title: "Complete probability assignments", time: "10:00 AM", status: "completed", topic: "Probability" },
      { id: "t2", title: "Read chapter 6 of Statistics", time: "11:30 AM", status: "completed", topic: "Statistics" },
      { id: "t3", title: "Solve 3 graph problems", time: "02:00 PM", status: "pending", topic: "DSA" },
    ],
  },
]

export const mockTopics: TopicProgress[] = [
  { id: "tp1", name: "Probability", completed: 8, total: 10 },
  { id: "tp2", name: "Statistics", completed: 4, total: 12 },
  { id: "tp3", name: "DSA", completed: 15, total: 20 },
  { id: "tp4", name: "DBMS", completed: 3, total: 8 },
  { id: "tp5", name: "OS", completed: 2, total: 10 },
]

export const TEAM_CODE = "dBr1x9kZ4W"

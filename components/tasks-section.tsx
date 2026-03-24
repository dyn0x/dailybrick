"use client"

import { useState } from "react"
import { Check, Trash2, Clock, ArrowUpFromLine, Plus, CalendarClock } from "lucide-react"
import { Task, mockCarriedForwardTasks } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TaskRowProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

function TaskRow({ task, onToggle, onDelete, disabled }: TaskRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 px-4 rounded-xl group transition-all duration-150",
        "hover:bg-secondary/60",
        task.status === "completed" && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => !disabled && onToggle(task.id)}
        disabled={disabled}
        aria-label={task.status === "completed" ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150",
          task.status === "completed"
            ? "bg-primary border-primary"
            : "border-border hover:border-primary/60",
          disabled && "cursor-default"
        )}
      >
        {task.status === "completed" && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium text-foreground truncate transition-all",
            task.status === "completed" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">{task.time}</span>
          {task.topic && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
              {task.topic}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0",
          task.status === "completed"
            ? "bg-primary/15 text-primary"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {task.status === "completed" ? "Done" : "Pending"}
      </span>

      {/* Delete */}
      {!disabled && (
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

interface TasksSectionProps {
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  onAddTask?: (task: Task) => void
  showNotification?: (msg: string) => void
}

export function TasksSection({ tasks, setTasks, showNotification }: TasksSectionProps) {
  const [newTitle, setNewTitle] = useState("")
  const [newTime, setNewTime] = useState("09:00")
  const [carriedTasks, setCarriedTasks] = useState<Task[]>(mockCarriedForwardTasks)

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const deleteCarriedTask = (id: string) => {
    setCarriedTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleCarried = (id: string) => {
    setCarriedTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t
      )
    )
  }

  const addTask = () => {
    if (!newTitle.trim()) return
    const timeLabel = newTime
      ? new Date(`2000-01-01T${newTime}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "Any time"
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      time: timeLabel,
      status: "pending",
    }
    setTasks((prev) => [...prev, task])
    showNotification?.(`Task '${task.title}' scheduled at ${task.time}`)
    setNewTitle("")
    setNewTime("09:00")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Carried forward */}
      {carriedTasks.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-chart-5/5">
            <ArrowUpFromLine className="w-4 h-4 text-chart-5" />
            <h3 className="text-sm font-semibold text-foreground">Moved from Yesterday</h3>
            <span className="ml-auto text-xs text-muted-foreground">{carriedTasks.length} tasks</span>
          </div>
          <div className="px-2 py-1">
            {carriedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={toggleCarried}
                onDelete={deleteCarriedTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's tasks */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{"Today's Tasks"}</h3>
          <span className="ml-auto text-xs text-muted-foreground">{tasks.length} tasks</span>
        </div>

        {/* Task list */}
        <div className="px-2 py-1">
          {tasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No tasks for today</p>
              <p className="text-xs text-muted-foreground/70">Add your first task below to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>

        {/* Add task */}
        <div className="px-4 pb-4 pt-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1 h-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-xl text-sm"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="h-9 px-3 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={addTask}
              className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              aria-label="Add task"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

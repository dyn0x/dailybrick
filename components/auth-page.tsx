"use client"

import { useState } from "react"
import { Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthPageProps {
  onLogin: () => void
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Box className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">DailyBrick</span>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-1">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your DailyBrick workspace"
                : "Start managing your daily tasks today"}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-secondary mb-6">
            <button
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                mode === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                mode === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium mt-1"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

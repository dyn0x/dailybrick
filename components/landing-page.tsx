"use client"

import Link from "next/link"
import { lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"

const Spline = lazy(() => import("@splinetool/react-spline"))

// nav links removed per design request

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
      <p className="text-foreground text-xl font-semibold tracking-tight">DAILYBRICK</p>

      {/* center nav intentionally removed */}

      <Button
        asChild
        variant="navCta"
        size="lg"
        className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6"
      >
        <Link href="/auth">Sign In</Link>
      </Button>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />

      <div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
        <h1
          className="opacity-0 animate-fade-up text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-foreground mb-2 md:mb-4 uppercase"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="block">BUILD CONSISTENCY</span>
          <span className="block text-primary">EVERY DAY</span>
        </h1>

        <p
          className="opacity-0 animate-fade-up text-muted-foreground text-[clamp(0.875rem,1.5vw,1.25rem)] font-light mb-4 md:mb-8"
          style={{ animationDelay: "0.55s" }}
        >
          Plan daily tasks, carry unfinished work forward automatically, and stay accountable with your teammate.
        </p>

        <div
          className="opacity-0 animate-fade-up flex flex-wrap gap-3 font-bold"
          style={{ animationDelay: "0.7s" }}
        >
          <Link
            href="/auth"
            className="pointer-events-auto bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-110 transition-all active:scale-[0.97]"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="pointer-events-auto bg-white text-background px-6 py-3 md:px-8 md:py-4 text-sm rounded-sm cursor-pointer hover:brightness-90 transition-all active:scale-[0.97]"
          >
            Create Account
          </Link>
        </div>

        <p
          className="opacity-0 animate-fade-up text-muted-foreground/60 text-xs font-light mt-4 md:mt-6"
          style={{ animationDelay: "0.85s" }}
        >
          © DailyBrick 2026. A craft of Manas Dutta.
        </p>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <div className="bg-hero-bg min-h-screen">
      <Navbar />
      <HeroSection />
    </div>
  )
}

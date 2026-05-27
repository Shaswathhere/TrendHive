'use client';

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { logError, logInfo } from "@/lib/logger"
import { Sparkles } from "lucide-react"
import { PublicOnlyRoute } from "@/components/auth/routeGuards"

function LoginView() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    logInfo("Login", "Email sign-in started", { email })
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      logInfo("Login", "Email sign-in succeeded", { uid: credential.user.uid })
      router.push("/app")
    } catch (err) {
      logError("Login", "Email sign-in failed", { email, message: err.message, code: err.code })
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsLoading(true)
    logInfo("Login", "Google sign-in started")
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      logInfo("Login", "Google sign-in succeeded", { uid: credential.user.uid })
      router.push("/app")
    } catch (err) {
      logError("Login", "Google sign-in failed", { message: err.message, code: err.code })
      setError(err.message || "Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5ff] dark:bg-[#0c0a1e] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-300/20 dark:bg-indigo-800/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-violet-300/20 dark:bg-violet-800/15 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 gradient-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#1e1b4b] dark:text-white tracking-tight">TrendHive</span>
        </div>

        <Card className="p-8 bg-white dark:bg-[#13102a] border border-[#e0e0f0] dark:border-[#2d2a50] shadow-xl">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#1e1b4b] dark:text-white mb-1.5 tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#6b7280]">Sign in to your TrendHive account to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl animate-fade-in">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#1e1b4b] dark:text-[#c7d2fe]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-[#1e1b4b] dark:text-[#c7d2fe]">Password</Label>
                <Link href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-indigo text-white font-semibold rounded-xl shadow-md shadow-indigo-500/25 hover:opacity-90 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e0e0f0] dark:border-[#2d2a50]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-[#13102a] text-[#6b7280]">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] text-[#1e1b4b] dark:text-[#c7d2fe] hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-[#6b7280] mt-6 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </Card>

        <p className="text-center text-[#6b7280] text-xs mt-5">
          By signing in, you agree to our{" "}
          <Link href="#" className="underline hover:text-indigo-600 transition-colors">Terms</Link>{" "}and{" "}
          <Link href="#" className="underline hover:text-indigo-600 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <LoginView />
    </PublicOnlyRoute>
  )
}

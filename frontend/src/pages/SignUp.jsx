import { useState } from "react"
import {Link, useNavigate} from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth"
import { auth, googleProvider } from "../lib/firebase"
import { logError, logInfo, logWarn } from "@/lib/logger"

export function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    logInfo("Signup", "Email sign-up started", {
      email: formData.email,
      hasDisplayName: Boolean(formData.fullName),
    })

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      logWarn("Signup", "Password confirmation failed", { email: formData.email })
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(userCredential.user, { displayName: formData.fullName })
      logInfo("Signup", "Email sign-up succeeded", {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      })
      navigate("/app", { replace: true })
    } catch (err) {
      logError("Signup", "Email sign-up failed", {
        email: formData.email,
        message: err.message,
        code: err.code,
      })
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsLoading(true)
    logInfo("Signup", "Google sign-up started")

    try {
      const credential = await signInWithPopup(auth, googleProvider)
      logInfo("Signup", "Google sign-up succeeded", {
        uid: credential.user.uid,
        email: credential.user.email,
      })
      navigate("/app", { replace: true })
    } catch (err) {
      logError("Signup", "Google sign-up failed", {
        message: err.message,
        code: err.code,
      })
      setError(err.message || "Failed to continue with Google")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">TrendHive</span>
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 bg-white border border-slate-200 shadow-lg card-hover">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600 text-sm">Join TrendHive to discover and analyze trends</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <Label htmlFor="fullName" className="text-slate-700 font-medium text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 transition-all duration-300"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 transition-all duration-300"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 transition-all duration-300"
                required
              />
              <p className="text-xs text-slate-500 mt-2">Min. 6 characters</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-200 transition-all duration-300"
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                className="mt-1 border-slate-300"
              />
              <Label htmlFor="terms" className="text-xs text-slate-600 font-normal cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-up"
              style={{ animationDelay: "0.35s" }}
              disabled={!agreeTerms || isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8 animate-fade-in">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-600">or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50 hover:border-emerald-300 transition-all duration-300 bg-transparent"
              onClick={handleGoogleSignUp}
              disabled={!agreeTerms || isLoading}
            >
              Google
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-center text-slate-600 mt-8 animate-fade-in text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
            >
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

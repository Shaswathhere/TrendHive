import { useState } from "react"
import { User2, ShieldCheck, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspace } from "@/hooks/useWorkspace"
import { logError, logInfo } from "@/lib/logger"

export function ProfilePage() {
  const { user } = useAuth()
  const { preferences, profile, updatePreferences, isWorkspaceLoading } = useWorkspace()
  const [isSaving, setIsSaving] = useState(false)

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "T").toUpperCase()

  async function handleChange(event) {
    const { name, value } = event.target
    const nextPreferences = { ...preferences, [name]: value }
    setIsSaving(true)
    try {
      await updatePreferences(nextPreferences)
      logInfo("Profile", "Preferences updated", { name, value })
    } catch (error) {
      logError("Profile", "Failed to update preferences", { name, message: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile hero */}
      <section className="relative overflow-hidden rounded-2xl gradient-indigo p-6 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold backdrop-blur flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-200 font-semibold mb-1">Account</p>
            <h1 className="text-xl font-bold tracking-tight">{profile?.displayName || user?.displayName || "TrendHive User"}</h1>
            <p className="text-sm text-indigo-200">{profile?.email || user?.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        {/* Profile details */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#1e1b4b] dark:text-white">
              <User2 className="h-4 w-4 text-indigo-500" />
              Profile
            </CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Basic user profile details from Firebase Authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account info card */}
            <div className="rounded-xl border border-indigo-100 dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-400 font-semibold mb-1">Display Name</p>
              <p className="text-base font-semibold text-[#1e1b4b] dark:text-white">
                {profile?.displayName || user?.displayName || "TrendHive user"}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-100 dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-400 font-semibold mb-1">Email</p>
              <p className="text-base font-semibold text-[#1e1b4b] dark:text-white">
                {profile?.email || user?.email || "No email available"}
              </p>
            </div>

            {/* Status chips */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-xl bg-[#1e1b4b] dark:bg-[#0a0818] p-4 border border-indigo-900">
                <p className="text-xs text-indigo-400 mb-1">Workspace role</p>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Explorer
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 p-4 border border-emerald-200 dark:border-emerald-900">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Account status</p>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authenticated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1e1b4b] dark:text-white">Preferences</CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Stored in Firestore for your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "focusArea", label: "Focus Area" },
              { id: "updateFrequency", label: "Update Frequency" },
              { id: "preferredFormat", label: "Preferred Format" },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id} className="text-xs font-medium text-[#1e1b4b] dark:text-[#c7d2fe]">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  name={field.id}
                  value={preferences[field.id]}
                  onChange={handleChange}
                  disabled={isWorkspaceLoading || isSaving}
                  className="h-10 rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                />
              </div>
            ))}

            <p className="text-xs text-[#6b7280] pt-1">
              {isWorkspaceLoading
                ? "Loading profile preferences from Firestore..."
                : isSaving
                  ? "Saving your changes..."
                  : "Changes are synced to Firestore instantly."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

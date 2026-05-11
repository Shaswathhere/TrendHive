import { useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AuthContext } from "@/context/auth-context"
import { logError, logInfo } from "@/lib/logger"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      logInfo("Auth", "Auth state changed", {
        isAuthenticated: Boolean(nextUser),
        uid: nextUser?.uid,
        email: nextUser?.email,
      })
      setUser(nextUser)
      setIsLoading(false)
    }, (error) => {
      logError("Auth", "Auth state listener failed", {
        message: error.message,
        code: error.code,
      })
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      logout: async () => {
        logInfo("Auth", "Logout requested", { uid: user?.uid, email: user?.email })
        await signOut(auth)
        logInfo("Auth", "Logout completed", { uid: user?.uid, email: user?.email })
      },
    }),
    [user, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

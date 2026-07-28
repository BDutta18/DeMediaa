"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  address: string | null
  token: string | null
  login: (address: string, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  address: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedToken = localStorage.getItem("demedia_token")
    const storedAddress = localStorage.getItem("demedia_address")

    if (storedToken && storedAddress) {
      setToken(storedToken)
      setAddress(storedAddress.toUpperCase())
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const protectedRoutes = ["/dashboard", "/content", "/upload", "/wallet", "/profile"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))

      if (isProtectedRoute && !isAuthenticated) {
        router.push("/auth")
      }
    }
  }, [isAuthenticated, pathname, router, isLoading])

  const login = (userAddress: string, userToken: string) => {
    localStorage.setItem("demedia_token", userToken)
    localStorage.setItem("demedia_address", userAddress.toUpperCase())
    setToken(userToken)
    setAddress(userAddress.toUpperCase())
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("demedia_token")
    localStorage.removeItem("demedia_address")
    setToken(null)
    setAddress(null)
    setIsAuthenticated(false)
    router.push("/")
  }

  const value = useMemo(
    () => ({ isAuthenticated, address, token, login, logout, isLoading }),
    [isAuthenticated, address, token, login, logout, isLoading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

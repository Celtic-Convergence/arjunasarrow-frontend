import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { getCurrentUser, signOut as cognitoSignOut, getSession, type User as CognitoUser } from '@/lib/cognitoClient'
import { useRouter } from 'next/router'

interface AuthContextType {
  user: CognitoUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
  sessionToken: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Session cache duration (5 minutes)
const SESSION_CACHE_DURATION = 5 * 60 * 1000
const SESSION_STORAGE_KEY = 'auth_session_cache'

interface SessionCache {
  user: CognitoUser | null
  token: string | null
  timestamp: number
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const router = useRouter()
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const cacheSession = useCallback((user: CognitoUser | null, token: string | null): void => {
    try {
      const sessionCache: SessionCache = {
        user,
        token,
        timestamp: Date.now()
      }
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionCache))
    } catch (error) {
      console.error('Error caching session:', error)
    }
  }, [])

  const clearSessionCache = useCallback((): void => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing session cache:', error)
    }
  }, [])

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      // Quick check for existing Cognito tokens
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        // Get session for token
        const sessionResult = await getSession()
        const token = sessionResult.data?.session ? 
          (sessionResult.data.session as any)?.tokens?.idToken?.toString() : null
        
        setUser(currentUser)
        setSessionToken(token)
        cacheSession(currentUser, token)
      } else {
        // User is not authenticated, which is fine for public pages
        setUser(null)
        setSessionToken(null)
        clearSessionCache()
      }
    } catch (error) {
      // Only log actual unexpected errors, not authentication errors
      if (error instanceof Error && 
          !error.message.includes('UserUnAuthenticatedException') &&
          !error.message.includes('User needs to be authenticated')) {
        console.error('Auth refresh error:', error)
      }
      setUser(null)
      setSessionToken(null)
      clearSessionCache()
    } finally {
      setIsLoading(false)
    }
  }, [cacheSession, clearSessionCache])

  // Load cached session immediately on mount
  useEffect(() => {
    const loadCachedSession = (): boolean => {
      try {
        const cached = localStorage.getItem(SESSION_STORAGE_KEY)
        if (cached) {
          const sessionCache: SessionCache = JSON.parse(cached)
          const now = Date.now()
          
          // Check if cache is still valid
          if (now - sessionCache.timestamp < SESSION_CACHE_DURATION) {
            setUser(sessionCache.user || null)
            setSessionToken(sessionCache.token)
            setIsLoading(false)
            
            // Refresh in background
            refreshAuth()
            return true
          }
        }
      } catch (error) {
        console.error('Error loading cached session:', error)
      }
      return false
    }

    const hasCachedSession = loadCachedSession()
    if (!hasCachedSession) {
      refreshAuth()
    }
  }, [refreshAuth])

  const signOut = useCallback(async (): Promise<void> => {
    // Immediately clear state and redirect for instant UX
    setUser(null)
    setSessionToken(null)
    clearSessionCache()
    
    // Redirect immediately
    router.push('/login')
    
    // Sign out from Cognito in the background
    try {
      await cognitoSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }, [router, clearSessionCache])

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshAuth,
    sessionToken
  }), [user, isLoading, signOut, refreshAuth, sessionToken])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
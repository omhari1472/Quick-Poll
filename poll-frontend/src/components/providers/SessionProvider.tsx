'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { apiClient } from '@/api/client'

interface SessionContextType {
  sessionId: string
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Get or create session ID
    let storedSessionId: string
    
    if (typeof window !== 'undefined') {
      storedSessionId = localStorage.getItem('quickpoll-session-id') || ''
      
      if (!storedSessionId) {
        storedSessionId = uuidv4()
        localStorage.setItem('quickpoll-session-id', storedSessionId)
      }
    } else {
      // Server-side fallback
      storedSessionId = uuidv4()
    }
    
    // Set session ID in API client
    apiClient.setSessionId(storedSessionId)
    setSessionId(storedSessionId)
  }, [])

  // Always render children, even if sessionId is not set yet
  // The API client will handle the session ID when it's available

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

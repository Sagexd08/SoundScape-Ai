'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'
import { handleGlobalErrors } from '@/utils/errorHandler'

// Create context for tracking online status
interface NetworkContextType {
  isOnline: boolean
  isSlowConnection: boolean
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSlowConnection: false,
})

export function useNetwork() {
  return useContext(NetworkContext)
}

interface NetworkProviderProps {
  children: ReactNode
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    // Setup global error handling
    handleGlobalErrors()

    // Track online status
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('You are back online', {
        description: 'Your connection has been restored',
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('You are offline', {
        description: 'Check your connection and try again',
      })
    }

    // Check for slow connection using navigation timing API
    const checkConnectionSpeed = () => {
      if (
        typeof window !== 'undefined' &&
        window.performance &&
        window.performance.timing
      ) {
        const { timing } = window.performance
        const pageLoadTime =
          timing.loadEventEnd - timing.navigationStart
        
        // If load time is more than 3 seconds, consider it a slow connection
        if (pageLoadTime > 3000) {
          setIsSlowConnection(true)
        }
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('load', checkConnectionSpeed)

    // Periodically check connection quality
    const intervalId = setInterval(() => {
      if (isOnline) {
        // Create a test request to check connection speed
        const start = Date.now()
        fetch('/api/healthcheck', { cache: 'no-store' })
          .then(() => {
            const duration = Date.now() - start
            // If ping takes more than 1 second, mark as slow connection
            setIsSlowConnection(duration > 1000)
          })
          .catch(() => {
            // If fetch fails, we might be offline
            if (navigator.onLine === false) {
              setIsOnline(false)
            }
          })
      }
    }, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('load', checkConnectionSpeed)
      clearInterval(intervalId)
    }
  }, [isOnline])

  return (
    <NetworkContext.Provider value={{ isOnline, isSlowConnection }}>
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-1 text-sm fixed top-0 left-0 right-0 z-50">
          You are currently offline. Some features may not work properly.
        </div>
      )}
      {isSlowConnection && isOnline && (
        <div className="bg-yellow-500 text-white text-center py-1 text-sm fixed top-0 left-0 right-0 z-50">
          Slow network detected. Performance may be affected.
        </div>
      )}
      {children}
    </NetworkContext.Provider>
  )
}
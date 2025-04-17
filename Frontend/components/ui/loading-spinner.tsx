'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'accent' | 'white'
}

export function LoadingSpinner({
  size = 'md',
  className,
  color = 'primary',
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  }[size]

  const colorClass = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    accent: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  }[color]

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClass,
        colorClass,
        className
      )}
    />
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  children: React.ReactNode
  fullPage?: boolean
}

export function LoadingOverlay({
  isLoading,
  text = 'Loading...',
  children,
  fullPage = false,
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50',
            fullPage && 'fixed'
          )}
        >
          <LoadingSpinner size="lg" />
          {text && (
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface LoadingContentProps {
  isLoading: boolean
  loadingText?: string
  error?: Error | null
  errorText?: string
  children: React.ReactNode
  onRetry?: () => void
}

export function LoadingContent({
  isLoading,
  loadingText = 'Loading...',
  error,
  errorText = 'Something went wrong',
  children,
  onRetry,
}: LoadingContentProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">{loadingText}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">{errorText}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error.message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
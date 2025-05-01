'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Import the correct types from next-themes
import type { ThemeProviderProps as NextThemesProviderProps } from 'next-themes';

// Use the imported type
type ThemeProviderProps = React.PropsWithChildren<Omit<NextThemesProviderProps, 'children'>>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

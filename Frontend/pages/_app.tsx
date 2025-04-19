import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// This is a minimal _app.tsx file to handle pages directory routing
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // For pages directory, we'll redirect most routes to the app directory
    // This helps with the transition from pages to app router
    const path = router.pathname

    // Skip redirects for special pages
    if (path === '/404' || path === '/_error') {
      return
    }

    // Redirect to app directory equivalent if not already there
    // Only redirect API routes to prevent infinite loops
    if (path.startsWith('/api/')) {
      router.push('/api' + path)
    }
  }, [router])

  return <Component {...pageProps} />
}

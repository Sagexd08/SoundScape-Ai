'use client'

// Global error page for the Next.js app router
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <title>Error - SoundScape AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes gradientBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .gradient-text {
            background: linear-gradient(to right, #6366f1, #a855f7, #ec4899);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .animated-gradient {
            background: linear-gradient(-45deg, #4f46e5, #7e22ce, #be185d, #4f46e5);
            background-size: 400% 400%;
            animation: gradientBg 15s ease infinite;
          }

          .spin-slow {
            animation: spin 20s linear infinite;
          }

          .float-animation {
            animation: float 6s ease-in-out infinite;
          }

          .pulse-animation {
            animation: pulse 3s ease-in-out infinite;
          }
        ` }} />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #000000, #1e1b4b)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background elements */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
            opacity: 0.6
          }}></div>

          {/* Decorative elements */}
          <div className="spin-slow" style={{
            position: 'absolute',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}></div>

          <div className="spin-slow" style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}></div>

          {/* Floating orbs */}
          <div className="float-animation pulse-animation" style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.1)',
            filter: 'blur(40px)',
            top: '20%',
            left: '15%'
          }}></div>

          <div className="float-animation pulse-animation" style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.1)',
            filter: 'blur(60px)',
            bottom: '15%',
            right: '10%',
            animationDelay: '2s'
          }}></div>

          {/* Content card */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '500px',
            width: '90%',
            padding: '3rem',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            {/* Error icon with glow */}
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.2)',
                filter: 'blur(15px)'
              }} className="pulse-animation"></div>

              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                  <path d="M21 22v-6h-6"></path>
                </svg>
              </div>
            </div>

            {/* Error title with gradient */}
            <h1 className="gradient-text" style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Something went wrong
            </h1>

            {/* Decorative line */}
            <div style={{
              width: '60px',
              height: '3px',
              margin: '1rem auto',
              background: 'linear-gradient(to right, #6366f1, #a855f7)',
              borderRadius: '999px'
            }}></div>

            {/* Error message */}
            <p style={{
              color: '#d1d5db',
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              We're sorry, but we encountered an error while loading this page.
              {error.digest && (
                <span style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>

            {/* Try again button with gradient */}
            <button
              onClick={() => reset()}
              className="animated-gradient"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 20px -3px rgba(79, 70, 229, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                <path d="M21 22v-6h-6"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

import Link from 'next/link'
import Head from 'next/head'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | SoundScape AI</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative overflow-hidden">
        {/* Static background elements */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900/40 to-black">
          <div className="absolute inset-0 opacity-20 mix-blend-soft-light"></div>
        </div>

        {/* Static nebula-like effects */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute top-[5%] -left-[5%] w-[80%] h-[70%] rounded-full bg-indigo-600/15 filter blur-[120px]"></div>
          <div className="absolute bottom-[0%] -right-[10%] w-[70%] h-[60%] rounded-full bg-purple-600/15 filter blur-[120px]"></div>
          <div className="absolute top-[30%] right-[5%] w-[50%] h-[50%] rounded-full bg-blue-600/10 filter blur-[100px]"></div>
        </div>

        {/* Static grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '120px 120px'
          }}
        ></div>

        {/* Static decorative elements */}
        <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full bg-indigo-600/10 filter blur-[80px]"></div>
        <div className="absolute bottom-[5%] right-[3%] w-96 h-96 rounded-full bg-purple-600/10 filter blur-[100px]"></div>
        <div className="absolute top-1/4 right-1/5 w-64 h-64 rounded-full bg-blue-600/10 filter blur-[70px]"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full p-8 bg-black/60 backdrop-blur-md rounded-lg border border-gray-800 text-center shadow-2xl shadow-indigo-900/20">
              {/* 404 with gradient text */}
              <h1 className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500">
                404
              </h1>

              {/* Decorative line */}
              <div className="w-16 h-1 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>

              <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>

              <p className="text-gray-300 mb-8">
                The page you're looking for doesn't exist or has been moved.
              </p>

              {/* Static glowing orbs */}
              <div className="absolute w-4 h-4 rounded-full bg-indigo-500/30 blur-md"
                   style={{ top: '20%', left: '10%' }} />
              <div className="absolute w-3 h-3 rounded-full bg-purple-500/30 blur-md"
                   style={{ bottom: '15%', right: '10%' }} />

              {/* Button */}
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-md font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-1"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

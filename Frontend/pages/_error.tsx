import Link from 'next/link'

function Error({ statusCode }: { statusCode: number }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950 text-white relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 max-w-md w-full p-8 bg-black/60 backdrop-blur-md rounded-lg border border-gray-800 text-center">
        <h1 className="text-4xl font-bold mb-2">{statusCode}</h1>
        <h2 className="text-2xl font-semibold mb-6">An Error Occurred</h2>
        <p className="text-gray-300 mb-8">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </p>
        <div className="flex justify-center">
          <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: { res: any, err: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error

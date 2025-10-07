import { Link } from '@remix-run/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold">Harkkapankki</span>
              </Link>
              <div className="ml-6 flex items-center space-x-4">
                <Link
                  to="/exercises"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Exercises
                </Link>
                <Link
                  to="/practise-sessions"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Practise sessions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

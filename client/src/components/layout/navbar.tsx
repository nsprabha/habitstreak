import { Link, useLocation } from "wouter";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onNewTask?: () => void;
}

export default function Navbar({ sidebarOpen, setSidebarOpen, onNewTask }: NavbarProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              type="button"
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary text-xl font-bold">HabitTracker</span>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`px-3 py-2 font-medium rounded-md ${
                  location === "/" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/reports" 
                className={`px-3 py-2 font-medium rounded-md ${
                  location === "/reports" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Reports
              </Link>
              <Link 
                href="/analytics" 
                className={`px-3 py-2 font-medium rounded-md ${
                  location === "/analytics" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Analytics
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button 
                onClick={onNewTask}
                className="relative inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Task</span>
              </button>
            </div>
            <div className="hidden md:ml-4 md:flex md:items-center">
              <button 
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="ml-3 relative">
                <div>
                  <button 
                    type="button"
                    className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      U
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

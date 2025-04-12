import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LeetCode Tracker - Track Your Problem Solving Journey",
  description: "An application to help you track your LeetCode progress",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <a href="/" className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">📘</span> LeetCode Tracker
                  </a>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 hover:bg-opacity-75 transition-colors">
                      Home
                    </a>
                    <a href="/add" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 hover:bg-opacity-75 transition-colors">
                      Import Problems
                    </a>
                    <a href="/problemset" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 hover:bg-opacity-75 transition-colors">
                      Problem Sets
                    </a>
                    <a href="/notes" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 hover:bg-opacity-75 transition-colors">
                      Knowledge Base
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>

        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              LeetCode Tracker © {new Date().getFullYear()} - Keep improving, become a better programmer
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

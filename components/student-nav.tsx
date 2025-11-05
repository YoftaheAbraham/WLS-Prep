"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "./theme-toggle"
import { useState } from "react"

interface StudentNavProps {
  userName: string
  userEmail: string
}

export default function StudentNav({ userName, userEmail }: StudentNavProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Navigation Bar */}
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo/Brand */}
          <Link 
            href="/student" 
            className="text-lg sm:text-xl lg:text-2xl font-bold hover:opacity-90 transition-opacity"
            onClick={closeMobileMenu}
          >
            WLSPrep
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* User Info */}
            <div className="text-right border-r border-white/30 pr-4 lg:pr-6">
              <p className="font-medium text-sm lg:text-base">{userName}</p>
              <p className="text-white/75 text-xs lg:text-sm">{userEmail}</p>
            </div>
            
            {/* Navigation Links */}
            <Link 
              href="/student/results" 
              className="hover:opacity-80 transition-opacity text-sm lg:text-base"
            >
              Results
            </Link>
            
            <ThemeToggle />
            
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm transition-opacity"
              >
                Logout
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:opacity-80 transition-opacity"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-4 border-t border-white border-opacity-20 pt-4">
            {/* User Info - Mobile */}
            <div className="text-center">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-white/75 text-xs">{userEmail}</p>
            </div>
            
            {/* Navigation Links - Mobile */}
            <Link
              href="/student/results"
              className="hover:opacity-80 transition-opacity py-2 text-sm text-center"
              onClick={closeMobileMenu}
            >
              Results
            </Link>
            
            <form onSubmit={(e) => {
              closeMobileMenu()
              handleLogout(e)
            }}>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm transition-opacity"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "./theme-toggle"
import { useState } from "react"

interface NavLink {
  href: string
  label: string
}

export default function AdminNav() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navLinks: NavLink[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/exams", label: "Exams" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/admins", label: "Admins" },
  ]

  return (
    <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Navigation Bar */}
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo/Brand */}
          <Link
            href="/admin"
            className="text-lg sm:text-xl font-bold hover:opacity-90 transition-opacity"
            onClick={closeMobileMenu}
          >
            WLSPrep Admin
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="hover:opacity-80 transition-opacity text-sm lg:text-base"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm transition-opacity"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:opacity-80 transition-opacity"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span
                  className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`} />
                <span
                  className={`block h-0.5 w-6 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"}`}
        >
          <div className="flex flex-col space-y-3 border-t border-white border-opacity-20 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="hover:opacity-80 transition-opacity py-2 text-sm"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                closeMobileMenu()
                handleLogout()
              }}
              className="px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm transition-opacity text-left w-fit"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/features" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Pricing", path: "/pricing" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black/80 backdrop-blur-md py-3 shadow-lg shadow-indigo-900/10" : "bg-transparent py-5",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">S</span>
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
              SoundScape
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors relative group",
                  pathname === item.path ? "text-indigo-400" : "text-gray-300 hover:text-indigo-300",
                )}
              >
                {item.name}
                {pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link href="/download">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Download App</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-200" /> : <Menu className="h-6 w-6 text-gray-200" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "block px-3 py-4 text-base font-medium border-b border-gray-800",
                    pathname === item.path ? "text-indigo-400" : "text-gray-300 hover:text-indigo-300",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2">
                <Link href="/download" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Download App</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

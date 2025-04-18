"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, LogOut, Settings, UserPlus, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: "Home", path: "/" },
  { name: "AI Studio", path: "/ai-studio", icon: <Wand2 className="h-4 w-4 mr-1" /> },
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
  const { user, signOut, isLoading } = useAuth()

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
          <Link href="/" className="flex items-center space-x-2" prefetch={false}>
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
                prefetch={false}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors relative group flex items-center",
                  pathname === item.path ? "text-indigo-400" : "text-gray-300 hover:text-indigo-300",
                )}
              >
                {item.icon && item.icon}
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

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {isLoading ? (
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
                      <span className="animate-pulse">...</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium hidden md:block max-w-[100px] truncate text-white">
                        {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                      </span>
                    </Button>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border border-gray-800">
                  <DropdownMenuLabel className="text-gray-300">
                    <div className="py-1">
                      <p className="text-sm font-medium text-white">
                        {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full flex items-center text-gray-300 focus:text-white focus:bg-gray-800" prefetch={false}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center text-gray-300 focus:text-white focus:bg-gray-800" prefetch={false}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full flex items-center text-gray-300 focus:text-white focus:bg-gray-800" prefetch={false}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut().then(() => {
                        window.location.href = '/login';
                      });
                    }}
                    className="text-gray-300 focus:text-white focus:bg-gray-800"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Switch Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-400 focus:text-red-300 focus:bg-gray-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Link href="/login" prefetch={false}>
                  <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
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
                  prefetch={false}
                  className={cn(
                    "block px-3 py-4 text-base font-medium border-b border-gray-800 flex items-center",
                    pathname === item.path ? "text-indigo-400" : "text-gray-300 hover:text-indigo-300",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && item.icon}
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2 space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} prefetch={false}>
                      <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950 mb-2">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} prefetch={false}>
                      <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950 mb-2">
                        Profile
                      </Button>
                    </Link>
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} prefetch={false}>
                      <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950 mb-2">
                        Settings
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        signOut().then(() => {
                          window.location.href = '/login';
                        });
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950 mb-2"
                    >
                      Switch Account
                    </Button>
                    <Button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} prefetch={false}>
                      <Button variant="outline" className="w-full border-indigo-600 text-indigo-400 hover:bg-indigo-950">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} prefetch={false}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, LogOut, Settings, UserPlus, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
            >
              <img
                src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png"
                alt="SoundScape AI Logo"
                className="w-full h-full object-cover"
              />
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
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {isLoading ? (
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
                      <span className="animate-pulse">...</span>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden">
                        {!user.user_metadata?.avatar_url && (
                          <img
                            src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png"
                            alt="SoundScape AI Logo"
                            className="w-full h-full object-cover"
                          />
                        )}
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
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="w-12 h-12 rounded-full flex items-center justify-center"
            >
              {mobileMenuOpen ?
                <X className="h-6 w-6 text-gray-200" /> :
                <Menu className="h-6 w-6 text-gray-200" />
              }
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
            className="md:hidden bg-gray-900/95 backdrop-blur-lg fixed left-0 right-0 z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={item.path}
                    prefetch={false}
                    className={cn(
                      "block px-4 py-4 text-base font-medium border-b border-gray-800 flex items-center rounded-md",
                      pathname === item.path
                        ? "text-indigo-400 bg-indigo-950/30"
                        : "text-gray-300 hover:text-indigo-300 hover:bg-gray-800/30",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3 flex items-center justify-center w-8 h-8 rounded-full bg-gray-800">
                      {item.icon || <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
                    </span>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-6 pb-4 space-y-3 mt-2"
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-4 p-4 mb-4 bg-gray-800/50 rounded-xl border border-gray-700">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full overflow-hidden bg-gray-700 border-2 border-indigo-500/30">
                        {!user.user_metadata?.avatar_url && (
                          <img
                            src="https://res.cloudinary.com/dm9h4bawl/image/upload/v1745476391/Screenshot_2025-04-24_120134_ijojnw.png"
                            alt="SoundScape AI Logo"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-white">
                            {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-medium text-white">
                          {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-sm text-gray-400 truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="block">
                        <Button variant="outline" className="w-full h-14 border-indigo-600 text-indigo-400 hover:bg-indigo-950 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="block">
                        <Button variant="outline" className="w-full h-14 border-indigo-600 text-indigo-400 hover:bg-indigo-950 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Profile
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link href="/settings" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="block">
                        <Button variant="outline" className="w-full h-14 border-indigo-600 text-indigo-400 hover:bg-indigo-950 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
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
                        className="w-full h-14 border-indigo-600 text-indigo-400 hover:bg-indigo-950 flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        Switch
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="block">
                        <Button variant="outline" className="w-full h-14 border-indigo-600 text-indigo-400 hover:bg-indigo-950 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                          </svg>
                          Log in
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)} prefetch={false} className="block">
                        <Button className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                          </svg>
                          Sign up
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  User, 
  LogOut, 
  Settings, 
  UserPlus, 
  ChevronDown,
  UserCircle
} from "lucide-react"

export function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.user_metadata?.display_name) {
      return user?.email?.substring(0, 2).toUpperCase() || "U"
    }
    
    const nameParts = user.user_metadata.display_name.split(" ")
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase()
    }
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
  }

  // Get user display name
  const getDisplayName = () => {
    return user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User"
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  // Handle switch account (sign in with a different account)
  const handleSwitchAccount = () => {
    // First sign out
    signOut().then(() => {
      // Then redirect to login page
      router.push("/login")
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8 border border-gray-700">
          <AvatarImage 
            src={user?.user_metadata?.avatar_url || ""} 
            alt={getDisplayName()} 
          />
          <AvatarFallback className="bg-indigo-600 text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">
          {getDisplayName()}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 border border-gray-800 z-50">
          <div className="py-2 px-4 border-b border-gray-800">
            <p className="text-sm font-medium text-white">{getDisplayName()}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="h-4 w-4" />
              Your Profile
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button 
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleSwitchAccount}
            >
              <UserPlus className="h-4 w-4" />
              Switch Account
            </button>
            <div className="border-t border-gray-800 my-1"></div>
            <button 
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

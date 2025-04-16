import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Subscription */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-800/20 p-6 md:p-10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay in tune with SoundScape</h3>
              <p className="text-gray-400">
                Subscribe to our newsletter for product updates, audio tips, and exclusive offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-900/50 border-gray-800 focus-visible:ring-indigo-500"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-700">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                SoundScape
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Personalized AI-powered audio environments that adapt to your surroundings and mood.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-indigo-400">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-400">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-400">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-indigo-400">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Column 2 - Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-indigo-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-400 hover:text-indigo-400">
                  User Guides
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-indigo-400">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-indigo-400">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-indigo-400">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-indigo-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-indigo-400">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-indigo-400">
                  Press Kit
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-indigo-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-indigo-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-indigo-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-indigo-400">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/licensing" className="text-gray-400 hover:text-indigo-400">
                  Licensing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 SoundScape. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/accessibility" className="text-gray-500 text-sm hover:text-indigo-400">
              Accessibility
            </Link>
            <Link href="/sitemap" className="text-gray-500 text-sm hover:text-indigo-400">
              Sitemap
            </Link>
            <Link
              href="https://github.com/soundscape"
              className="text-gray-500 text-sm hover:text-indigo-400 flex items-center"
            >
              <Github className="h-4 w-4 mr-1" />
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Brand</h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#home" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <a href="#home" className="text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
              Contact
            </a>
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
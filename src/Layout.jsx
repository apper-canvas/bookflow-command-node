import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { routeArray } from '@/config/routes'
import { useOverdueAlerts } from '@/hooks/useOverdueAlerts'

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { overdueCount } = useOverdueAlerts()

  const currentRoute = routeArray.find(route => route.path === location.pathname)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ApperIcon name="Library" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-primary">BookFlow</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/5 border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-4 h-4" />
                <span>{route.label}</span>
                {route.id === 'loans' && overdueCount > 0 && (
                  <span className="bg-error text-white text-xs rounded-full px-2 py-1 ml-1">
                    {overdueCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {overdueCount > 0 && (
              <div className="hidden md:flex items-center space-x-2 bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                <ApperIcon name="AlertCircle" className="w-4 h-4 text-error" />
                <span className="text-sm text-error font-medium">
                  {overdueCount} overdue book{overdueCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* User Avatar */}
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-4 h-4 text-white" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-16 right-0 w-64 h-full bg-white shadow-xl z-50 md:hidden"
            >
              <nav className="p-4 space-y-2">
                {routeArray.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'text-primary bg-primary/5'
                          : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} className="w-5 h-5" />
                    <span className="font-medium">{route.label}</span>
                    {route.id === 'loans' && overdueCount > 0 && (
                      <span className="bg-error text-white text-xs rounded-full px-2 py-1 ml-auto">
                        {overdueCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto bg-background">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Layout
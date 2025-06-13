import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { bookService } from '@/services'

const FilterSidebar = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [genres, setGenres] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true)
      try {
        const [genreList, authorList] = await Promise.all([
          bookService.getGenres(),
          bookService.getAuthors()
        ])
        setGenres(genreList)
        setAuthors(authorList)
      } catch (error) {
        console.error('Error loading filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFilterOptions()
  }, [])

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key] && filters[key] !== 'all')

  const sidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="small" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            value={filters.availability || 'all'}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="all">All Books</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre
          </label>
          <select
            value={filters.genre || 'all'}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            disabled={loading}
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <select
            value={filters.author || 'all'}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            disabled={loading}
          >
            <option value="all">All Authors</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6">
        {sidebarContent}
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          icon="Filter"
          onClick={onToggle}
          className="relative"
        >
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onToggle}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={onToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterSidebar
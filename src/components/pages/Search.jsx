import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import SearchBar from '@/components/molecules/SearchBar'
import FilterSidebar from '@/components/molecules/FilterSidebar'
import BookCard from '@/components/molecules/BookCard'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import EmptyState from '@/components/atoms/EmptyState'
import ErrorState from '@/components/atoms/ErrorState'
import ApperIcon from '@/components/ApperIcon'
import { bookService, loanService } from '@/services'

const Search = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Get search query from URL params
    const urlParams = new URLSearchParams(location.search)
    const query = urlParams.get('q') || ''
    
    if (query) {
      setSearchQuery(query)
      performSearch(query, {})
    }
  }, [location.search])

  const performSearch = async (query, searchFilters = {}) => {
    if (!query.trim() && Object.keys(searchFilters).length === 0) {
      setBooks([])
      setSearchPerformed(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearchPerformed(true)
    
    try {
      const result = await bookService.search(query, searchFilters)
      setBooks(result)
      
      // Update URL with search query
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Search failed')
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    performSearch(query, filters)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setBooks([])
    setSearchPerformed(false)
    navigate('/search', { replace: true })
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    if (searchQuery || Object.keys(newFilters).length > 0) {
      performSearch(searchQuery, newFilters)
    }
  }

  const handleBorrowBook = async (book) => {
    try {
      await loanService.borrowBook(book.id)
      await bookService.borrowBook(book.id)
      
      // Update local state
      setBooks(prev => prev.map(b => 
        b.id === book.id 
          ? { ...b, availableCopies: b.availableCopies - 1 }
          : b
      ))
      
      toast.success(`Successfully borrowed "${book.title}"!`)
    } catch (err) {
      toast.error(err.message || 'Failed to borrow book')
    }
  }

  return (
    <div className="flex h-full">
      <FilterSidebar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isOpen={mobileFiltersOpen}
        onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">Search Books</h1>
            
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex-1 max-w-2xl">
                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  placeholder="Search for books, authors, genres, ISBN..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="lg:hidden">
                  <FilterSidebar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    isOpen={mobileFiltersOpen}
                    onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  />
                </div>
                
                {books.length > 0 && (
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <ApperIcon name="Grid3X3" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <ApperIcon name="List" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && <SkeletonLoader count={6} type="card" />}

          {error && !loading && (
            <ErrorState message={error} onRetry={() => performSearch(searchQuery, filters)} />
          )}

          {!loading && !error && !searchPerformed && (
            <div className="text-center py-12">
              <ApperIcon name="Search" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Books</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Enter a book title, author name, genre, or ISBN to find books in our library
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Fiction', 'Mystery', 'George Orwell', 'Fantasy'].map(term => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && !error && searchPerformed && books.length === 0 && (
            <EmptyState
              icon="Search"
              title="No books found"
              description={`No results found for "${searchQuery}". Try different keywords or adjust your filters.`}
              actionLabel="Clear Search"
              onAction={handleClearSearch}
            />
          )}

          {!loading && !error && books.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {books.length} book{books.length > 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                    : 'space-y-4'
                }
              >
                {books.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BookCard
                      book={book}
                      onBorrow={handleBorrowBook}
                      showBorrowButton={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import SearchBar from '@/components/molecules/SearchBar'
import FilterSidebar from '@/components/molecules/FilterSidebar'
import BookCard from '@/components/molecules/BookCard'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import EmptyState from '@/components/atoms/EmptyState'
import ErrorState from '@/components/atoms/ErrorState'
import OverdueAlert from '@/components/organisms/OverdueAlert'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { bookService, loanService } from '@/services'

const BrowseBooks = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
const [viewMode, setViewMode] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [borrowing, setBorrowing] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [userReservations, setUserReservations] = useState([])

useEffect(() => {
    loadBooks()
    loadUserReservations()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchQuery, filters])

  const loadBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await bookService.getAll()
      setBooks(result)
    } catch (err) {
      setError(err.message || 'Failed to load books')
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
}

  const loadUserReservations = async () => {
    try {
      const reservations = await loanService.getReservationQueue()
      setUserReservations(reservations)
    } catch (err) {
      console.error('Error loading reservations:', err)
    }
  }

  const filterBooks = async () => {
    try {
      let result = books
      
      if (searchQuery || Object.keys(filters).length > 0) {
        result = await bookService.search(searchQuery, filters)
      }
      
      setFilteredBooks(result)
    } catch (err) {
      console.error('Error filtering books:', err)
      setFilteredBooks(books)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleBorrowBook = async (book) => {
    setBorrowing(true)
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
    } finally {
      setBorrowing(false)
    }
}

  const handleReserveBook = async (book) => {
    setReserving(true)
    try {
      const reservation = await loanService.reserveBook(book.id)
      
      // Update local reservations state
      setUserReservations(prev => [...prev, reservation])
      
      toast.success(`Successfully reserved "${book.title}"! You are #${reservation.position} in queue.`)
    } catch (err) {
      toast.error(err.message || 'Failed to reserve book')
    } finally {
      setReserving(false)
    }
  }

  const getUserReservationForBook = (bookId) => {
    return userReservations.find(reservation => 
      reservation.bookId === bookId && reservation.status === 'active'
    )
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <SkeletonLoader count={6} type="card" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState message={error} onRetry={loadBooks} />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={mobileFiltersOpen}
        onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <OverdueAlert />
          
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">Browse Books</h1>
            
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex-1 max-w-md">
                <SearchBar
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  placeholder="Search books, authors, genres..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="lg:hidden">
                  <FilterSidebar
                    filters={filters}
                    onFiltersChange={setFilters}
                    isOpen={mobileFiltersOpen}
                    onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  />
                </div>
                
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
              </div>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </div>

          {filteredBooks.length === 0 ? (
            <EmptyState
              icon="BookOpen"
              title="No books found"
              description={searchQuery || Object.keys(filters).length > 0 
                ? "Try adjusting your search or filters" 
                : "No books available in the library"
              }
              actionLabel={searchQuery || Object.keys(filters).length > 0 ? "Clear Filters" : undefined}
              onAction={() => {
                setSearchQuery('')
                setFilters({})
              }}
            />
          ) : (
<motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BookCard
                    book={book}
                    onBorrow={handleBorrowBook}
                    onReserve={handleReserveBook}
                    userReservation={getUserReservationForBook(book.id)}
                    showBorrowButton={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrowseBooks
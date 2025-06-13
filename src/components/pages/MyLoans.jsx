import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import LoanCard from '@/components/molecules/LoanCard'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import EmptyState from '@/components/atoms/EmptyState'
import ErrorState from '@/components/atoms/ErrorState'
import OverdueAlert from '@/components/organisms/OverdueAlert'
import ApperIcon from '@/components/ApperIcon'
import { loanService, bookService } from '@/services'

const MyLoans = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('active') // 'active', 'all', 'overdue'

  useEffect(() => {
    loadLoans()
  }, [])

  const loadLoans = async () => {
    setLoading(true)
    setError(null)
    try {
const result = await loanService.getCurrentLoans()
      setLoans(result)
    } catch (err) {
      setError(err.message || 'Failed to load loans')
      toast.error('Failed to load loans')
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loan) => {
    try {
await loanService.returnBook(loan.id)
      await bookService.returnBook(loan.bookId)
      
      // Update local state
      setLoans(prev => prev.map(l => 
        l.id === loan.id 
          ? { ...l, status: 'returned', returnDate: new Date() }
          : l
      ))
      
      toast.success('Book returned successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to return book')
    }
  }

  const handleRenewLoan = async (loan) => {
    try {
      const renewedLoan = await loanService.renewLoan(loan.id)
      
      // Update local state
      setLoans(prev => prev.map(l => 
        l.id === loan.id ? renewedLoan : l
      ))
      
      toast.success('Loan renewed successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to renew loan')
    }
  }

  const getFilteredLoans = () => {
    const now = new Date()
    
    switch (filter) {
      case 'active':
        return loans.filter(loan => loan.status === 'active')
      case 'overdue':
        return loans.filter(loan => 
          loan.status === 'active' && new Date(loan.dueDate) < now
        )
      case 'all':
      default:
        return loans
    }
  }

  const filteredLoans = getFilteredLoans()
  const overdueCount = loans.filter(loan => 
    loan.status === 'active' && new Date(loan.dueDate) < new Date()
  ).length

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            ))}
          </div>
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState message={error} onRetry={loadLoans} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <OverdueAlert />
      
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">My Loans</h1>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Loans ({loans.filter(l => l.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              filter === 'overdue'
                ? 'bg-error text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue ({overdueCount})
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Loans ({loans.length})
          </button>
        </div>
      </div>

      {filteredLoans.length === 0 ? (
        <EmptyState
          icon="BookOpen"
          title={
            filter === 'active' ? "No active loans" :
            filter === 'overdue' ? "No overdue books" :
            "No loan history"
          }
          description={
            filter === 'active' ? "You don't have any books currently borrowed" :
            filter === 'overdue' ? "Great! You don't have any overdue books" :
            "You haven't borrowed any books yet"
          }
          actionLabel={filter !== 'active' ? undefined : "Browse Books"}
          onAction={() => window.location.href = '/browse'}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredLoans.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LoanCard
                loan={loan}
                onReturn={handleReturnBook}
                onRenew={handleRenewLoan}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Summary Card */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Loan Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {loans.filter(l => l.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Loans</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">
              {overdueCount}
            </div>
            <div className="text-sm text-gray-600">Overdue Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${loans.reduce((total, loan) => total + (loan.lateFee || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Fees</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyLoans
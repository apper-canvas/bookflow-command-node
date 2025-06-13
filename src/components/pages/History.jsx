import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import LoanCard from '@/components/molecules/LoanCard'
import SkeletonLoader from '@/components/atoms/SkeletonLoader'
import EmptyState from '@/components/atoms/EmptyState'
import ErrorState from '@/components/atoms/ErrorState'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { loanService } from '@/services'

const History = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'returned', 'active'
  const [sortBy, setSortBy] = useState('borrowDate') // 'borrowDate', 'dueDate', 'returnDate'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loanService.getLoanHistory()
      setLoans(result)
    } catch (err) {
      setError(err.message || 'Failed to load history')
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAndSortedLoans = () => {
    let filtered = loans

    // Apply filter
    if (filter === 'returned') {
      filtered = loans.filter(loan => loan.status === 'returned')
    } else if (filter === 'active') {
      filtered = loans.filter(loan => loan.status === 'active')
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'borrowDate':
          aValue = new Date(a.borrowDate)
          bValue = new Date(b.borrowDate)
          break
        case 'dueDate':
          aValue = new Date(a.dueDate)
          bValue = new Date(b.dueDate)
          break
        case 'returnDate':
          aValue = a.returnDate ? new Date(a.returnDate) : new Date(0)
          bValue = b.returnDate ? new Date(b.returnDate) : new Date(0)
          break
        default:
          aValue = new Date(a.borrowDate)
          bValue = new Date(b.borrowDate)
      }

      if (sortOrder === 'desc') {
        return bValue - aValue
      } else {
        return aValue - bValue
      }
    })

    return filtered
  }

  const exportHistory = () => {
    const csvContent = [
      ['Book ID', 'Borrow Date', 'Due Date', 'Return Date', 'Status', 'Late Fee'],
      ...loans.map(loan => [
        loan.bookId,
        format(loan.borrowDate, 'yyyy-MM-dd'),
        format(loan.dueDate, 'yyyy-MM-dd'),
        loan.returnDate ? format(loan.returnDate, 'yyyy-MM-dd') : '',
        loan.status,
        loan.lateFee || 0
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'loan-history.csv'
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('History exported successfully!')
  }

  const filteredLoans = getFilteredAndSortedLoans()
  const totalFees = loans.reduce((total, loan) => total + (loan.lateFee || 0), 0)
  const returnedCount = loans.filter(l => l.status === 'returned').length
  const activeCount = loans.filter(l => l.status === 'active').length

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
        <SkeletonLoader count={5} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState message={error} onRetry={loadHistory} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4 lg:mb-0">
            Borrowing History
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              icon="Download"
              onClick={exportHistory}
              size="small"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-primary">{loans.length}</div>
            <div className="text-sm text-gray-600">Total Loans</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-success">{returnedCount}</div>
            <div className="text-sm text-gray-600">Returned</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-warning">{activeCount}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-error">${totalFees.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Fees</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({loans.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-warning text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('returned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'returned'
                  ? 'bg-success text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Returned ({returnedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="borrowDate">Borrow Date</option>
              <option value="dueDate">Due Date</option>
              <option value="returnDate">Return Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ApperIcon 
                name={sortOrder === 'desc' ? 'ArrowDown' : 'ArrowUp'} 
                className="w-4 h-4 text-gray-600" 
              />
            </button>
          </div>
        </div>
      </div>

      {filteredLoans.length === 0 ? (
        <EmptyState
          icon="History"
          title="No loan history"
          description={
            filter === 'all' 
              ? "You haven't borrowed any books yet"
              : `No ${filter} loans found`
          }
          actionLabel={filter !== 'all' ? "Show All History" : "Browse Books"}
          onAction={() => {
            if (filter !== 'all') {
              setFilter('all')
            } else {
              window.location.href = '/browse'
            }
          }}
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
              transition={{ delay: index * 0.05 }}
            >
              <LoanCard loan={loan} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default History
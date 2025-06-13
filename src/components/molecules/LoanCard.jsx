import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { differenceInDays, isAfter } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import BookDetailModal from './BookDetailModal'
import { bookService } from '@/services'

const LoanCard = ({ loan, onReturn, onRenew }) => {
  const [book, setBook] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true)
      try {
        const bookData = await bookService.getById(loan.bookId)
        setBook(bookData)
      } catch (error) {
        console.error('Error loading book:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBook()
  }, [loan.bookId])

  const getDaysRemaining = () => {
    const now = new Date()
    return differenceInDays(loan.dueDate, now)
  }

  const isOverdue = () => {
    return isAfter(new Date(), loan.dueDate)
  }

  const getStatusBadge = () => {
    if (loan.status === 'returned') {
      return <Badge variant="success">Returned</Badge>
    }
    
    if (isOverdue()) {
      const daysOverdue = Math.abs(getDaysRemaining())
      return <Badge variant="error">Overdue ({daysOverdue} days)</Badge>
    }
    
    const daysRemaining = getDaysRemaining()
    if (daysRemaining <= 3) {
      return <Badge variant="warning">Due in {daysRemaining} days</Badge>
    }
    
    return <Badge variant="success">Due in {daysRemaining} days</Badge>
  }

  if (loading || !book) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="flex space-x-4">
          <div className="w-16 h-20 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-sm border p-4 ${
          isOverdue() && loan.status === 'active' ? 'border-error bg-error/5' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start space-x-4">
          <div 
            className="w-16 h-20 bg-gray-100 rounded cursor-pointer flex-shrink-0"
            onClick={() => setShowModal(true)}
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64x80/f3f4f6/9ca3af?text=Book'
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              className="font-serif font-semibold text-gray-900 text-sm mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
              onClick={() => setShowModal(true)}
            >
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2">{book.author}</p>
            
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge()}
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-medium">Borrowed:</span> {loan.borrowDate.toLocaleDateString()}</p>
              <p><span className="font-medium">Due:</span> {loan.dueDate.toLocaleDateString()}</p>
              {loan.returnDate && (
                <p><span className="font-medium">Returned:</span> {loan.returnDate.toLocaleDateString()}</p>
              )}
              {loan.lateFee > 0 && (
                <p className="text-error"><span className="font-medium">Late Fee:</span> ${loan.lateFee.toFixed(2)}</p>
              )}
            </div>
          </div>

          {loan.status === 'active' && (
            <div className="flex flex-col gap-2">
              <Button
                size="small"
                variant="accent"
                onClick={() => onReturn(loan)}
              >
                Return
              </Button>
              {!isOverdue() && (
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => onRenew(loan)}
                >
                  Renew
                </Button>
              )}
            </div>
          )}
        </div>

        {isOverdue() && loan.status === 'active' && (
          <div className="mt-3 flex items-center gap-2 text-error text-xs">
            <ApperIcon name="AlertCircle" className="w-4 h-4" />
            <span>This book is overdue. Please return it as soon as possible.</span>
          </div>
        )}
      </motion.div>

      <BookDetailModal
        book={book}
        loan={loan}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReturn={onReturn}
        showBorrowButton={false}
        showReturnButton={loan.status === 'active'}
      />
    </>
  )
}

export default LoanCard
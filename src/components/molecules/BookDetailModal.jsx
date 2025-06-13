import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const BookDetailModal = ({ 
  book, 
  isOpen, 
  onClose, 
  onBorrow, 
  onReturn,
  showBorrowButton = true,
  showReturnButton = false,
  loan = null
}) => {
  const getAvailabilityBadge = () => {
    if (book.availableCopies === 0) {
      return <Badge variant="error">Unavailable</Badge>
    }
    if (book.availableCopies <= 2) {
      return <Badge variant="warning">{book.availableCopies} available</Badge>
    }
    return <Badge variant="success">{book.availableCopies} available</Badge>
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-6 border-b">
                <h2 className="text-xl font-serif font-bold text-gray-900">Book Details</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=No+Cover'
                        }}
                      />
                    </div>
                  </div>

                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                        {book.title}
                      </h1>
                      <p className="text-lg text-gray-600 mb-1">by {book.author}</p>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="default">{book.genre}</Badge>
                        <span className="text-sm text-gray-500">{book.publicationYear}</span>
                        {getAvailabilityBadge()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ISBN:</span>
                        <p className="text-gray-600">{book.isbn}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total Copies:</span>
                        <p className="text-gray-600">{book.totalCopies}</p>
                      </div>
                    </div>

                    {book.description && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {book.description}
                        </p>
                      </div>
                    )}

                    {loan && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 mb-2">Loan Information</h3>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Borrowed:</span> {loan.borrowDate?.toLocaleDateString()}</p>
                          <p><span className="font-medium">Due:</span> {loan.dueDate?.toLocaleDateString()}</p>
                          {loan.lateFee > 0 && (
                            <p className="text-error"><span className="font-medium">Late Fee:</span> ${loan.lateFee.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {showBorrowButton && (
                        <Button
                          variant={book.availableCopies > 0 ? "primary" : "outline"}
                          disabled={book.availableCopies === 0}
                          onClick={() => {
                            if (book.availableCopies > 0) {
                              onBorrow?.(book)
                              onClose()
                            }
                          }}
                          className="flex-1"
                        >
                          {book.availableCopies > 0 ? 'Borrow Book' : 'Unavailable'}
                        </Button>
                      )}
                      
                      {showReturnButton && (
                        <Button
                          variant="accent"
                          onClick={() => {
                            onReturn?.(loan)
                            onClose()
                          }}
                          className="flex-1"
                        >
                          Return Book
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BookDetailModal
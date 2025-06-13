import { motion } from 'framer-motion'
import { useState } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import ReservationQueue from '@/components/atoms/ReservationQueue'
import BookDetailModal from './BookDetailModal'

const BookCard = ({ book, onBorrow, onReserve, userReservation, showBorrowButton = true }) => {
  const [showModal, setShowModal] = useState(false)

  const getAvailabilityBadge = () => {
    if (book.availableCopies === 0) {
      return <Badge variant="error">Unavailable</Badge>
    }
    if (book.availableCopies <= 2) {
      return <Badge variant="warning">{book.availableCopies} left</Badge>
    }
    return <Badge variant="success">{book.availableCopies} available</Badge>
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=No+Cover'
            }}
          />
          <div className="absolute top-2 right-2">
            {getAvailabilityBadge()}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-serif font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2">{book.author}</p>
          <p className="text-xs text-gray-500 mb-3">{book.genre} • {book.publicationYear}</p>
          
{showBorrowButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {book.availableCopies > 0 ? (
                <Button
                  size="small"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBorrow?.(book)
                  }}
                  className="w-full"
                >
                  Borrow
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReserve?.(book)
                  }}
                  className="w-full"
                >
                  Reserve
                </Button>
              )}
              
              {userReservation && (
                <ReservationQueue
                  position={userReservation.position}
                  estimatedAvailability={userReservation.estimatedAvailability}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>

<BookDetailModal
        book={book}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBorrow={onBorrow}
        onReserve={onReserve}
        userReservation={userReservation}
        showBorrowButton={showBorrowButton}
      />
    </>
  )
}

export default BookCard
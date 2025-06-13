import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { format } from 'date-fns'

const ReservationQueue = ({ position, estimatedAvailability, className = '' }) => {
  if (!position) return null

  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <ApperIcon name="Clock" className="w-3 h-3 text-blue-600" />
        <span className="text-xs font-medium text-blue-800">
          Position #{position} in queue
        </span>
      </div>
      
      {estimatedAvailability && (
        <p className="text-xs text-blue-600">
          Est. available: {formatDate(estimatedAvailability)}
        </p>
      )}
    </motion.div>
  )
}

export default ReservationQueue
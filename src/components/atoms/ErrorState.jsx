import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from './Button'

const ErrorState = ({ 
  message = 'Something went wrong',
  onRetry,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="mb-4">
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Oops!</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

export default ErrorState
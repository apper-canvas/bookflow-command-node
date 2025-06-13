import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { useOverdueAlerts } from '@/hooks/useOverdueAlerts'

const OverdueAlert = () => {
  const { overdueCount, overdueLoans } = useOverdueAlerts()

  if (overdueCount === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-error text-white p-4 rounded-lg shadow-lg border border-error/20 mb-6"
      >
        <div className="flex items-start space-x-3">
          <ApperIcon name="AlertCircle" className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">
              Overdue Books Alert
            </h3>
            <p className="text-sm opacity-90 mb-3">
              You have {overdueCount} overdue book{overdueCount > 1 ? 's' : ''}. 
              Please return {overdueCount > 1 ? 'them' : 'it'} as soon as possible to avoid additional late fees.
            </p>
            
            {overdueLoans.length > 0 && (
              <div className="space-y-1">
                {overdueLoans.slice(0, 3).map((loan, index) => (
                  <div key={loan.id} className="text-xs opacity-80">
                    • Book ID: {loan.bookId} (Due: {loan.dueDate.toLocaleDateString()})
                  </div>
                ))}
                {overdueLoans.length > 3 && (
                  <div className="text-xs opacity-80">
                    • And {overdueLoans.length - 3} more...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OverdueAlert
import { useState, useEffect } from 'react'
import { loanService } from '@/services'

export const useOverdueAlerts = () => {
  const [overdueCount, setOverdueCount] = useState(0)
  const [overdueLoans, setOverdueLoans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkOverdueLoans = async () => {
      setLoading(true)
      try {
const overdue = await loanService.getOverdueLoans()
        setOverdueLoans(overdue)
        setOverdueCount(overdue.length)
      } catch (error) {
        console.error('Error checking overdue loans:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOverdueLoans()
    
    // Check every 5 minutes for overdue books
    const interval = setInterval(checkOverdueLoans, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    overdueCount,
    overdueLoans,
    loading
  }
}
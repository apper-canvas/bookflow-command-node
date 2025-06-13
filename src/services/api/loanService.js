import loansData from '../mockData/loans.json'
import { addDays, isAfter, differenceInDays } from 'date-fns'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class LoanService {
  constructor() {
    this.loans = loansData.map(loan => ({
      ...loan,
      borrowDate: new Date(loan.borrowDate),
      dueDate: new Date(loan.dueDate),
      returnDate: loan.returnDate ? new Date(loan.returnDate) : null
    }))
  }

  async getAll() {
    await delay(300)
    return [...this.loans]
  }

  async getById(id) {
    await delay(200)
    const loan = this.loans.find(loan => loan.id === id)
    return loan ? { ...loan } : null
  }

  async getCurrentLoans(userId = 'current-user') {
    await delay(300)
    return this.loans
      .filter(loan => loan.userId === userId && loan.status === 'active')
      .map(loan => ({ ...loan }))
  }

  async getLoanHistory(userId = 'current-user') {
    await delay(300)
    return this.loans
      .filter(loan => loan.userId === userId)
      .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
      .map(loan => ({ ...loan }))
  }

  async getOverdueLoans(userId = 'current-user') {
    await delay(200)
    const now = new Date()
    return this.loans
      .filter(loan => 
        loan.userId === userId && 
        loan.status === 'active' && 
        isAfter(now, loan.dueDate)
      )
      .map(loan => ({ ...loan }))
  }

  async borrowBook(bookId, userId = 'current-user') {
    await delay(400)
    const borrowDate = new Date()
    const dueDate = addDays(borrowDate, 14) // 2 weeks loan period
    
    const newLoan = {
      id: Date.now().toString(),
      userId,
      bookId,
      borrowDate,
      dueDate,
      returnDate: null,
      status: 'active',
      lateFee: 0
    }
    
    this.loans.push(newLoan)
    return { ...newLoan }
  }

  async returnBook(loanId) {
    await delay(400)
    const loan = this.loans.find(l => l.id === loanId)
    if (!loan) {
      throw new Error('Loan not found')
    }

    const returnDate = new Date()
    let lateFee = 0

    // Calculate late fee if overdue
    if (isAfter(returnDate, loan.dueDate)) {
      const daysLate = differenceInDays(returnDate, loan.dueDate)
      lateFee = daysLate * 0.50 // $0.50 per day late fee
    }

    loan.returnDate = returnDate
    loan.status = 'returned'
    loan.lateFee = lateFee

    return { ...loan }
  }

  async renewLoan(loanId) {
    await delay(300)
    const loan = this.loans.find(l => l.id === loanId)
    if (!loan || loan.status !== 'active') {
      throw new Error('Loan not found or not active')
    }

    // Check if already overdue
    if (isAfter(new Date(), loan.dueDate)) {
      throw new Error('Cannot renew overdue books')
    }

    // Extend due date by 14 days
    loan.dueDate = addDays(loan.dueDate, 14)
    return { ...loan }
  }

  async create(loanData) {
    await delay(300)
    const newLoan = {
      ...loanData,
      id: Date.now().toString(),
      borrowDate: new Date(loanData.borrowDate),
      dueDate: new Date(loanData.dueDate),
      returnDate: loanData.returnDate ? new Date(loanData.returnDate) : null
    }
    this.loans.push(newLoan)
    return { ...newLoan }
  }

  async update(id, loanData) {
    await delay(300)
    const index = this.loans.findIndex(loan => loan.id === id)
    if (index !== -1) {
      this.loans[index] = { 
        ...this.loans[index], 
        ...loanData,
        borrowDate: loanData.borrowDate ? new Date(loanData.borrowDate) : this.loans[index].borrowDate,
        dueDate: loanData.dueDate ? new Date(loanData.dueDate) : this.loans[index].dueDate,
        returnDate: loanData.returnDate ? new Date(loanData.returnDate) : this.loans[index].returnDate
      }
      return { ...this.loans[index] }
    }
    throw new Error('Loan not found')
  }

  async delete(id) {
    await delay(300)
    const index = this.loans.findIndex(loan => loan.id === id)
    if (index !== -1) {
      const deletedLoan = this.loans.splice(index, 1)[0]
      return { ...deletedLoan }
    }
    throw new Error('Loan not found')
  }
// Reservation Queue Methods
  async getReservationQueue(userId = 'current-user') {
    await delay(300)
    // Mock reservation data - in real app would come from database
    const reservations = [
      {
        id: '1',
        userId: 'current-user',
        bookId: '1',
        reservationDate: new Date('2024-01-15'),
        position: 1,
        estimatedAvailability: addDays(new Date(), 7)
      },
      {
        id: '2', 
        userId: 'current-user',
        bookId: '3',
        reservationDate: new Date('2024-01-16'),
        position: 2,
        estimatedAvailability: addDays(new Date(), 14)
      }
    ]
    
    return reservations.filter(r => r.userId === userId)
  }

  async reserveBook(bookId, userId = 'current-user') {
    await delay(400)
    
    // Check existing reservations for this book to determine position
    const existingReservations = await this.getBookReservations(bookId)
    const position = existingReservations.length + 1
    
    // Estimate availability based on current loans and queue
    const estimatedDays = position * 7 // Rough estimate: 1 week per position
    const estimatedAvailability = addDays(new Date(), estimatedDays)
    
    const newReservation = {
      id: Date.now().toString(),
      userId,
      bookId,
      reservationDate: new Date(),
      position,
      estimatedAvailability,
      status: 'active'
    }
    
    return { ...newReservation }
  }

  async getBookReservations(bookId) {
    await delay(200)
    // Mock method to get all reservations for a specific book
    const allReservations = [
      { id: '1', bookId: '1', position: 1 },
      { id: '2', bookId: '3', position: 1 },
      { id: '3', bookId: '3', position: 2 }
    ]
    
    return allReservations.filter(r => r.bookId === bookId)
  }

  async cancelReservation(reservationId) {
    await delay(300)
    // In real app, would remove from database and update positions
    return { success: true }
  }

  async estimateAvailability(bookId) {
    await delay(200)
    
    // Get active loans for this book
    const activeLoans = this.loans.filter(loan => 
      loan.bookId === bookId && loan.status === 'active'
    )
    
    // Get reservation queue
    const reservations = await this.getBookReservations(bookId)
    
    // Estimate based on earliest due date + queue position
    let estimatedDays = 7 // Default 1 week
    
    if (activeLoans.length > 0) {
      const earliestDueDate = activeLoans.reduce((earliest, loan) => 
        loan.dueDate < earliest ? loan.dueDate : earliest, 
        activeLoans[0].dueDate
      )
      
      const daysUntilReturn = differenceInDays(earliestDueDate, new Date())
      estimatedDays = Math.max(daysUntilReturn, 1) + (reservations.length * 7)
    }
    
    return addDays(new Date(), estimatedDays)
  }
}

export default new LoanService()
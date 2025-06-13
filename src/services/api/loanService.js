import { addDays, isAfter, differenceInDays } from 'date-fns'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class LoanService {
  constructor() {
    // Initialize ApperClient for database operations
    this.getApperClient = () => {
      const { ApperClient } = window.ApperSDK;
      return new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    };
  }

  async getAll() {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      const params = {
        Fields: ['Name', 'user_id', 'book_id', 'borrow_date', 'due_date', 'return_date', 'status', 'late_fee']
      };
      
      const response = await apperClient.fetchRecords('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Convert date strings to Date objects
      const loans = (response.data || []).map(loan => ({
        ...loan,
        borrowDate: new Date(loan.borrow_date),
        dueDate: new Date(loan.due_date),
        returnDate: loan.return_date ? new Date(loan.return_date) : null,
        userId: loan.user_id,
        bookId: loan.book_id,
        lateFee: loan.late_fee || 0
      }));
      
      return loans;
    } catch (error) {
      console.error("Error fetching loans:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: ['Name', 'user_id', 'book_id', 'borrow_date', 'due_date', 'return_date', 'status', 'late_fee']
      };
      
      const response = await apperClient.getRecordById('loan', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (!response.data) return null;
      
      // Convert date strings to Date objects
      const loan = {
        ...response.data,
        borrowDate: new Date(response.data.borrow_date),
        dueDate: new Date(response.data.due_date),
        returnDate: response.data.return_date ? new Date(response.data.return_date) : null,
        userId: response.data.user_id,
        bookId: response.data.book_id,
        lateFee: response.data.late_fee || 0
      };
      
      return loan;
    } catch (error) {
      console.error(`Error fetching loan with ID ${id}:`, error);
      return null;
    }
  }

  async getCurrentLoans(userId = 'current-user') {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      const params = {
        Fields: ['Name', 'user_id', 'book_id', 'borrow_date', 'due_date', 'return_date', 'status', 'late_fee'],
        where: [
          {
            FieldName: "user_id",
            Operator: "ExactMatch",
            Values: [userId]
          },
          {
            FieldName: "status",
            Operator: "ExactMatch", 
            Values: ["active"]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Convert date strings to Date objects
      const loans = (response.data || []).map(loan => ({
        ...loan,
        borrowDate: new Date(loan.borrow_date),
        dueDate: new Date(loan.due_date),
        returnDate: loan.return_date ? new Date(loan.return_date) : null,
        userId: loan.user_id,
        bookId: loan.book_id,
        lateFee: loan.late_fee || 0
      }));
      
      return loans;
    } catch (error) {
      console.error("Error fetching current loans:", error);
      throw error;
    }
  }

  async getLoanHistory(userId = 'current-user') {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      const params = {
        Fields: ['Name', 'user_id', 'book_id', 'borrow_date', 'due_date', 'return_date', 'status', 'late_fee'],
        where: [
          {
            FieldName: "user_id",
            Operator: "ExactMatch",
            Values: [userId]
          }
        ],
        orderBy: [
          {
            FieldName: "borrow_date",
            SortType: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Convert date strings to Date objects
      const loans = (response.data || []).map(loan => ({
        ...loan,
        borrowDate: new Date(loan.borrow_date),
        dueDate: new Date(loan.due_date),
        returnDate: loan.return_date ? new Date(loan.return_date) : null,
        userId: loan.user_id,
        bookId: loan.book_id,
        lateFee: loan.late_fee || 0
      }));
      
      return loans;
    } catch (error) {
      console.error("Error fetching loan history:", error);
      throw error;
    }
  }

  async getOverdueLoans(userId = 'current-user') {
    await delay(200)
    try {
      const apperClient = this.getApperClient();
      const now = new Date().toISOString();
      
      const params = {
        Fields: ['Name', 'user_id', 'book_id', 'borrow_date', 'due_date', 'return_date', 'status', 'late_fee'],
        where: [
          {
            FieldName: "user_id",
            Operator: "ExactMatch",
            Values: [userId]
          },
          {
            FieldName: "status",
            Operator: "ExactMatch",
            Values: ["active"]
          },
          {
            FieldName: "due_date",
            Operator: "LessThan",
            Values: [now]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Convert date strings to Date objects
      const loans = (response.data || []).map(loan => ({
        ...loan,
        borrowDate: new Date(loan.borrow_date),
        dueDate: new Date(loan.due_date),
        returnDate: loan.return_date ? new Date(loan.return_date) : null,
        userId: loan.user_id,
        bookId: loan.book_id,
        lateFee: loan.late_fee || 0
      }));
      
      return loans;
    } catch (error) {
      console.error("Error fetching overdue loans:", error);
      throw error;
    }
  }

  async borrowBook(bookId, userId = 'current-user') {
    await delay(400)
    try {
      const borrowDate = new Date()
      const dueDate = addDays(borrowDate, 14) // 2 weeks loan period
      
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Name: `Loan for book ${bookId}`,
          user_id: userId,
          book_id: parseInt(bookId),
          borrow_date: borrowDate.toISOString(),
          due_date: dueDate.toISOString(),
          return_date: null,
          status: 'active',
          late_fee: 0
        }]
      };
      
      const response = await apperClient.createRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create loan');
        }
        
        const loanData = response.results[0].data;
        return {
          ...loanData,
          borrowDate: new Date(loanData.borrow_date),
          dueDate: new Date(loanData.due_date),
          returnDate: null,
          userId: loanData.user_id,
          bookId: loanData.book_id,
          lateFee: loanData.late_fee || 0
        };
      }
      
      return {
        id: Date.now().toString(),
        userId,
        bookId,
        borrowDate,
        dueDate,
        returnDate: null,
        status: 'active',
        lateFee: 0
      };
    } catch (error) {
      console.error("Error borrowing book:", error);
      throw error;
    }
  }

  async returnBook(loanId) {
    await delay(400)
    try {
      const loan = await this.getById(loanId);
      if (!loan) {
        throw new Error('Loan not found');
      }

      const returnDate = new Date();
      let lateFee = 0;

      // Calculate late fee if overdue
      if (isAfter(returnDate, loan.dueDate)) {
        const daysLate = differenceInDays(returnDate, loan.dueDate);
        lateFee = daysLate * 0.50; // $0.50 per day late fee
      }

      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(loanId),
          return_date: returnDate.toISOString(),
          status: 'returned',
          late_fee: lateFee
        }]
      };
      
      const response = await apperClient.updateRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to return book');
        }
        
        const loanData = response.results[0].data;
        return {
          ...loanData,
          borrowDate: new Date(loanData.borrow_date),
          dueDate: new Date(loanData.due_date),
          returnDate: new Date(loanData.return_date),
          userId: loanData.user_id,
          bookId: loanData.book_id,
          lateFee: loanData.late_fee || 0
        };
      }
      
      return loan;
    } catch (error) {
      console.error("Error returning book:", error);
      throw error;
    }
  }

  async renewLoan(loanId) {
    await delay(300)
    try {
      const loan = await this.getById(loanId);
      if (!loan || loan.status !== 'active') {
        throw new Error('Loan not found or not active');
      }

      // Check if already overdue
      if (isAfter(new Date(), loan.dueDate)) {
        throw new Error('Cannot renew overdue books');
      }

      // Extend due date by 14 days
      const newDueDate = addDays(loan.dueDate, 14);

      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(loanId),
          due_date: newDueDate.toISOString()
        }]
      };
      
      const response = await apperClient.updateRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to renew loan');
        }
        
        const loanData = response.results[0].data;
        return {
          ...loanData,
          borrowDate: new Date(loanData.borrow_date),
          dueDate: new Date(loanData.due_date),
          returnDate: loanData.return_date ? new Date(loanData.return_date) : null,
          userId: loanData.user_id,
          bookId: loanData.book_id,
          lateFee: loanData.late_fee || 0
        };
      }
      
      return loan;
    } catch (error) {
      console.error("Error renewing loan:", error);
      throw error;
    }
  }

  async create(loanData) {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: loanData.Name || `Loan for book ${loanData.book_id || loanData.bookId}`,
          user_id: loanData.user_id || loanData.userId,
          book_id: parseInt(loanData.book_id || loanData.bookId),
          borrow_date: loanData.borrow_date || (loanData.borrowDate ? loanData.borrowDate.toISOString() : new Date().toISOString()),
          due_date: loanData.due_date || (loanData.dueDate ? loanData.dueDate.toISOString() : addDays(new Date(), 14).toISOString()),
          return_date: loanData.return_date || (loanData.returnDate ? loanData.returnDate.toISOString() : null),
          status: loanData.status || 'active',
          late_fee: loanData.late_fee || loanData.lateFee || 0
        }]
      };
      
      const response = await apperClient.createRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create loan');
        }
        
        const createdLoan = response.results[0].data;
        return {
          ...createdLoan,
          borrowDate: new Date(createdLoan.borrow_date),
          dueDate: new Date(createdLoan.due_date),
          returnDate: createdLoan.return_date ? new Date(createdLoan.return_date) : null,
          userId: createdLoan.user_id,
          bookId: createdLoan.book_id,
          lateFee: createdLoan.late_fee || 0
        };
      }
      
      return loanData;
    } catch (error) {
      console.error("Error creating loan:", error);
      throw error;
    }
  }

  async update(id, loanData) {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      
      // Only include updateable fields
      const updateFields = {
        Id: parseInt(id)
      };
      
      if (loanData.Name !== undefined) updateFields.Name = loanData.Name;
      if (loanData.user_id !== undefined) updateFields.user_id = loanData.user_id;
      if (loanData.book_id !== undefined) updateFields.book_id = parseInt(loanData.book_id);
      if (loanData.borrow_date !== undefined) updateFields.borrow_date = loanData.borrow_date;
      if (loanData.due_date !== undefined) updateFields.due_date = loanData.due_date;
      if (loanData.return_date !== undefined) updateFields.return_date = loanData.return_date;
      if (loanData.status !== undefined) updateFields.status = loanData.status;
      if (loanData.late_fee !== undefined) updateFields.late_fee = loanData.late_fee;
      
      const params = {
        records: [updateFields]
      };
      
      const response = await apperClient.updateRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update loan');
        }
        
        const updatedLoan = response.results[0].data;
        return {
          ...updatedLoan,
          borrowDate: new Date(updatedLoan.borrow_date),
          dueDate: new Date(updatedLoan.due_date),
          returnDate: updatedLoan.return_date ? new Date(updatedLoan.return_date) : null,
          userId: updatedLoan.user_id,
          bookId: updatedLoan.book_id,
          lateFee: updatedLoan.late_fee || 0
        };
      }
      
      return loanData;
    } catch (error) {
      console.error("Error updating loan:", error);
      throw error;
    }
  }

  async delete(id) {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('loan', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete loan');
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting loan:", error);
      throw error;
    }
  }

  // Reservation Queue Methods (Mock implementation - would need separate table in real app)
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
    
    return newReservation
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
    const allLoans = await this.getAll()
    const activeLoans = allLoans.filter(loan => 
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
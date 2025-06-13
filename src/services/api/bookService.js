const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class BookService {
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
        Fields: ['Name', 'isbn', 'title', 'author', 'genre', 'publication_year', 'cover_url', 'total_copies', 'available_copies', 'description']
      };
      
      const response = await apperClient.fetchRecords('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  }

  async getById(id) {
    await delay(200)
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: ['Name', 'isbn', 'title', 'author', 'genre', 'publication_year', 'cover_url', 'total_copies', 'available_copies', 'description']
      };
      
      const response = await apperClient.getRecordById('book', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      return null;
    }
  }

  async search(query, filters = {}) {
    await delay(400)
    try {
      const apperClient = this.getApperClient();
      let whereConditions = [];

      // Add search query conditions
      if (query && query.trim()) {
        const searchTerm = query.trim();
        whereConditions.push({
          FieldName: "title",
          Operator: "Contains",
          Values: [searchTerm]
        });
        whereConditions.push({
          FieldName: "author", 
          Operator: "Contains",
          Values: [searchTerm]
        });
        whereConditions.push({
          FieldName: "genre",
          Operator: "Contains", 
          Values: [searchTerm]
        });
      }

      // Add filter conditions
      if (filters.genre && filters.genre !== 'all') {
        whereConditions.push({
          FieldName: "genre",
          Operator: "ExactMatch",
          Values: [filters.genre]
        });
      }

      if (filters.author && filters.author !== 'all') {
        whereConditions.push({
          FieldName: "author",
          Operator: "ExactMatch",
          Values: [filters.author]
        });
      }

      if (filters.availability) {
        if (filters.availability === 'available') {
          whereConditions.push({
            FieldName: "available_copies",
            Operator: "GreaterThan",
            Values: ["0"]
          });
        } else if (filters.availability === 'unavailable') {
          whereConditions.push({
            FieldName: "available_copies",
            Operator: "ExactMatch",
            Values: ["0"]
          });
        }
      }

      const params = {
        Fields: ['Name', 'isbn', 'title', 'author', 'genre', 'publication_year', 'cover_url', 'total_copies', 'available_copies', 'description'],
        where: whereConditions
      };
      
      const response = await apperClient.fetchRecords('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error searching books:", error);
      throw error;
    }
  }

  async borrowBook(bookId) {
    await delay(300)
    try {
      // Get current book data
      const book = await this.getById(bookId);
      if (!book || book.available_copies <= 0) {
        throw new Error('Book not available for borrowing');
      }

      // Update available copies
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(bookId),
          available_copies: book.available_copies - 1
        }]
      };
      
      const response = await apperClient.updateRecord('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update book');
        }
        return response.results[0].data;
      }
      
      return book;
    } catch (error) {
      console.error("Error borrowing book:", error);
      throw error;
    }
  }

  async returnBook(bookId) {
    await delay(300)
    try {
      // Get current book data
      const book = await this.getById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      // Update available copies
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(bookId),
          available_copies: book.available_copies + 1
        }]
      };
      
      const response = await apperClient.updateRecord('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update book');
        }
        return response.results[0].data;
      }
      
      return book;
    } catch (error) {
      console.error("Error returning book:", error);
      throw error;
    }
  }

  async getGenres() {
    await delay(100)
    try {
      const books = await this.getAll();
      const genres = [...new Set(books.map(book => book.genre))];
      return genres.sort();
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  }

  async getAuthors() {
    await delay(100)
    try {
      const books = await this.getAll();
      const authors = [...new Set(books.map(book => book.author))];
      return authors.sort();
    } catch (error) {
      console.error("Error fetching authors:", error);
      return [];
    }
  }

  async create(bookData) {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: bookData.title || bookData.Name,
          isbn: bookData.isbn,
          title: bookData.title,
          author: bookData.author,
          genre: bookData.genre,
          publication_year: bookData.publication_year || bookData.publicationYear,
          cover_url: bookData.cover_url || bookData.coverUrl,
          total_copies: bookData.total_copies || bookData.totalCopies,
          available_copies: bookData.available_copies || bookData.availableCopies || bookData.total_copies || bookData.totalCopies,
          description: bookData.description
        }]
      };
      
      const response = await apperClient.createRecord('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create book');
        }
        return response.results[0].data;
      }
      
      return bookData;
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  }

  async update(id, bookData) {
    await delay(300)
    try {
      const apperClient = this.getApperClient();
      
      // Only include updateable fields
      const updateFields = {
        Id: parseInt(id)
      };
      
      if (bookData.Name !== undefined) updateFields.Name = bookData.Name;
      if (bookData.title !== undefined) updateFields.title = bookData.title;
      if (bookData.isbn !== undefined) updateFields.isbn = bookData.isbn;
      if (bookData.author !== undefined) updateFields.author = bookData.author;
      if (bookData.genre !== undefined) updateFields.genre = bookData.genre;
      if (bookData.publication_year !== undefined) updateFields.publication_year = bookData.publication_year;
      if (bookData.cover_url !== undefined) updateFields.cover_url = bookData.cover_url;
      if (bookData.total_copies !== undefined) updateFields.total_copies = bookData.total_copies;
      if (bookData.available_copies !== undefined) updateFields.available_copies = bookData.available_copies;
      if (bookData.description !== undefined) updateFields.description = bookData.description;
      
      const params = {
        records: [updateFields]
      };
      
      const response = await apperClient.updateRecord('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update book');
        }
        return response.results[0].data;
      }
      
      return bookData;
    } catch (error) {
      console.error("Error updating book:", error);
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
      
      const response = await apperClient.deleteRecord('book', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete book');
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  }
}

export default new BookService()
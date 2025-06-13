import booksData from '../mockData/books.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class BookService {
  constructor() {
    this.books = [...booksData]
  }

  async getAll() {
    await delay(300)
    return [...this.books]
  }

  async getById(id) {
    await delay(200)
    const book = this.books.find(book => book.id === id)
    return book ? { ...book } : null
  }

  async search(query, filters = {}) {
    await delay(400)
    let results = [...this.books]

    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.genre && filters.genre !== 'all') {
      results = results.filter(book => book.genre === filters.genre)
    }

    if (filters.availability) {
      if (filters.availability === 'available') {
        results = results.filter(book => book.availableCopies > 0)
      } else if (filters.availability === 'unavailable') {
        results = results.filter(book => book.availableCopies === 0)
      }
    }

    if (filters.author && filters.author !== 'all') {
      results = results.filter(book => book.author === filters.author)
    }

    return results
  }

  async borrowBook(bookId) {
    await delay(300)
    const book = this.books.find(b => b.id === bookId)
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1
      return { ...book }
    }
    throw new Error('Book not available for borrowing')
  }

  async returnBook(bookId) {
    await delay(300)
    const book = this.books.find(b => b.id === bookId)
    if (book) {
      book.availableCopies += 1
      return { ...book }
    }
    throw new Error('Book not found')
  }

  async getGenres() {
    await delay(100)
    const genres = [...new Set(this.books.map(book => book.genre))]
    return genres.sort()
  }

  async getAuthors() {
    await delay(100)
    const authors = [...new Set(this.books.map(book => book.author))]
    return authors.sort()
  }

  async create(bookData) {
    await delay(300)
    const newBook = {
      ...bookData,
      id: Date.now().toString(),
      availableCopies: bookData.totalCopies
    }
    this.books.push(newBook)
    return { ...newBook }
  }

  async update(id, bookData) {
    await delay(300)
    const index = this.books.findIndex(book => book.id === id)
    if (index !== -1) {
      this.books[index] = { ...this.books[index], ...bookData }
      return { ...this.books[index] }
    }
    throw new Error('Book not found')
  }

  async delete(id) {
    await delay(300)
    const index = this.books.findIndex(book => book.id === id)
    if (index !== -1) {
      const deletedBook = this.books.splice(index, 1)[0]
      return { ...deletedBook }
    }
    throw new Error('Book not found')
  }
}

export default new BookService()
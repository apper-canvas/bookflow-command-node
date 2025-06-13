import userData from '../mockData/users.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class UserService {
  constructor() {
    this.users = userData.map(user => ({
      ...user,
      memberSince: new Date(user.memberSince)
    }))
  }

  async getAll() {
    await delay(300)
    return [...this.users]
  }

  async getById(id) {
    await delay(200)
    const user = this.users.find(user => user.id === id)
    return user ? { ...user } : null
  }

  async getCurrentUser() {
    await delay(200)
    // Return the first user as current user for demo
    const user = this.users[0]
    return user ? { ...user } : null
  }

  async updateProfile(id, userData) {
    await delay(300)
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...userData }
      return { ...this.users[index] }
    }
    throw new Error('User not found')
  }

  async create(userData) {
    await delay(300)
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      memberSince: new Date(),
      currentLoans: [],
      loanHistory: [],
      finesOwed: 0
    }
    this.users.push(newUser)
    return { ...newUser }
  }

  async update(id, userData) {
    await delay(300)
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      this.users[index] = { 
        ...this.users[index], 
        ...userData,
        memberSince: userData.memberSince ? new Date(userData.memberSince) : this.users[index].memberSince
      }
      return { ...this.users[index] }
    }
    throw new Error('User not found')
  }

  async delete(id) {
    await delay(300)
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      const deletedUser = this.users.splice(index, 1)[0]
      return { ...deletedUser }
    }
    throw new Error('User not found')
  }
}

export default new UserService()
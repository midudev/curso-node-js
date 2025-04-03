import DBLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUND } from './config.js'
const { Schema } = new DBLocal({ path: './db' })

const User = Schema('User', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    Validatiton.password(password)
    Validatiton.username(username)
    const user = User.findOne({ username })
    if (user) throw new Error(`The username: ${username} is already taken`)
    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND)
    User.create({
      id,
      username,
      password: hashedPassword
    }).save()

    return id
  }

  static async login ({ username, password }) {
    Validatiton.username(username)
    Validatiton.password(password)

    const user = User.findOne({ username })
    if (!user) throw new Error('This user does not exist in our database')
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error('Incorrect password')
    const { password: _, ...publicUser } = user
    console.log(publicUser)
    return publicUser
  }
}

class Validatiton {
  static password (password) {
    if (typeof password !== 'string') throw new Error('Password must be a string')
    if (password.length < 6) throw new Error('Password at leat must have 6 characters long')
  }

  static username (username) {
    if (typeof username !== 'string') throw new Error('Username must be a string')
    if (username.length < 3) throw new Error('Username at least must be have 3 characters long')
  }
}

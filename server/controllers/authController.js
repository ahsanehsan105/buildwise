const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { RequestError, requiredText } = require('../utils/validation')

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email }
}

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

async function signup(req, res) {
  const name = requiredText(req.body.name, 'Name', 80)
  const email = requiredText(req.body.email, 'Email', 254).toLowerCase()
  const password = req.body.password

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequestError('Enter a valid email address.')
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new RequestError('Password must be between 8 and 128 characters.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })
  return res.status(201).json({ token: issueToken(user), user: publicUser(user) })
}

async function login(req, res) {
  const email = requiredText(req.body.email, 'Email', 254).toLowerCase()
  const password = req.body.password
  if (typeof password !== 'string' || !password) throw new RequestError('Password is required.')

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new RequestError('Email or password is incorrect.', 401)
  }
  return res.json({ token: issueToken(user), user: publicUser(user) })
}

async function me(req, res) {
  const user = await User.findById(req.userId)
  if (!user) throw new RequestError('Your account could not be found.', 401)
  return res.json({ user: publicUser(user) })
}

module.exports = { signup, login, me }

const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, age, diabeticSince, diabetesType, lastHbA1c } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({
      name, email, password, age,
      diabeticSince, diabetesType, lastHbA1c
    })

    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        diabetesType: user.diabetesType,
        diabeticSince: user.diabeticSince,
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        diabetesType: user.diabetesType,
        diabeticSince: user.diabeticSince,
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = { register, login, getMe }
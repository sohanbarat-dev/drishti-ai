const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./src/routes/authRoutes')
const scanRoutes = require('./src/routes/scanRoutes')

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/scans', scanRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'DrishtiAI Backend running ✅' })
})

// MongoDB connect + start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log(`✅ Backend running on port ${process.env.PORT}`)
    })
  })
  .catch(err => console.error('❌ MongoDB error:', err))
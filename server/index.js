require('dotenv').config()

const cors = require('cors')
const dns = require('node:dns')
const express = require('express')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const port = Number(process.env.PORT || 4000)
const mongoUri = process.env.MONGODB_URI
const defaultMongoDnsServers = process.env.NODE_ENV === 'production' ? '' : '1.1.1.1,1.0.0.1'
const mongoDnsServers = (process.env.MONGODB_DNS_SERVERS || defaultMongoDnsServers)
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean)

if (mongoDnsServers.length) dns.setServers(mongoDnsServers)

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value with at least 32 characters.')
}
if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Copy server/.env.example to server/.env and configure it.')
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use(errorHandler)

async function startServer() {
  try {
    await mongoose.connect(mongoUri)
    app.listen(port, () => {
      console.log(`Buildwise API listening on http://localhost:${port}`)
    })
  } catch (error) {
    if (error.code === 'ECONNREFUSED' && String(error.message).includes('querySrv')) {
      console.error('MongoDB Atlas SRV DNS lookup was refused. Verify the cluster hostname in MONGODB_URI, then try a network without VPN/DNS filtering or configure a working DNS resolver. For local MongoDB, use mongodb://127.0.0.1:27017/buildwise.')
    }
    console.error('Could not connect to MongoDB:', error.message)
    process.exitCode = 1
  }
}

startServer()

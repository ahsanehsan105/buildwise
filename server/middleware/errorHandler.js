function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error.code === 11000) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message })
  }

  console.error(error)
  return res.status(500).json({ message: 'Something went wrong. Please try again.' })
}

module.exports = { errorHandler }

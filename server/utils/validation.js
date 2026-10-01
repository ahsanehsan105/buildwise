class RequestError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

function requiredText(value, label, maxLength = 120) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new RequestError(`${label} is required and must be no longer than ${maxLength} characters.`)
  }
  return value.trim()
}

function positiveNumber(value, label, allowZero = false) {
  const number = Number(value)
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    throw new RequestError(`${label} must be a valid ${allowZero ? 'non-negative' : 'positive'} number.`)
  }
  return number
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

module.exports = { RequestError, requiredText, positiveNumber, validDate }

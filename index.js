module.exports = class ErrorHTTP extends Error {
  constructor (status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }

  get name () {
    return 'ErrorHTTP'
  }

  static middleware (err, req, res, next) {
    const validation = err.name === 'ValidationError'
    const critical = !(err.name === 'ErrorHTTP' || validation)

    if (critical) console.error(err.stack)
    if (res.headersSent) return next(err)
    if (!err.status) err.status = validation ? 400 : 500

    res.status(err.status).json({
      error: err.status,
      code: critical ? 'INTERNAL' : err.code,
      message: critical ? 'Internal error' : err.message
    })
  }
}

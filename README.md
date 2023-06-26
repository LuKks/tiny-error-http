# tiny-error-http

HTTP error middleware for Express

```
npm i tiny-error-http
```

## Usage

```js
const ErrorHTTP = require('tiny-error-http')
const express = require('express')
require('express-async-errors') // Because Express does not handle async errors by default

const app = express()

app.get('/error', function (req, res) {
  throw new ErrorHTTP(400)
})

app.get('/error-with-code', function (req, res) {
  throw new ErrorHTTP(403, 'ALREADY_LOGGED_IN')
})

app.get('/error-with-message', function (req, res) {
  throw new ErrorHTTP(403, 'ALREADY_LOGGED_IN', 'Already logged in')
})

app.get('/validation-error', function (req, res) {
  const err = new Error('Invalid email format')
  err.name = 'ValidationError' // For example, "yup" (lib) error
  throw err
})

app.use(ErrorHTTP.middleware)

app.listen(1337)
```

Native errors would log to `stderr` but return a status code of 500 and a generic message.

## License

MIT

const test = require('brittle')
const ErrorHTTP = require('./index.js')
const express = require('express')
const yup = require('yup')
const fetch = require('like-fetch')
require('express-async-errors')

const schema = yup.object().shape({
  password: yup.string().default('').min(3).max(4)
})

test('no error', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    res.json(true)
  })

  const response = await fetch(API)
  t.is(response.status, 200)
  t.alike(await response.json(), true)
})

test('error', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    throw new ErrorHTTP(403)
  })

  const response = await fetch(API)
  t.is(response.status, 403)
  t.alike(await response.json(), { error: 403, message: '' })
})

test('error code', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    throw new ErrorHTTP(403, 'ALREADY_LOGGED_IN')
  })

  const response = await fetch(API)
  t.is(response.status, 403)
  t.alike(await response.json(), { error: 403, code: 'ALREADY_LOGGED_IN', message: '' })
})

test('error code with message', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    throw new ErrorHTTP(403, 'ALREADY_LOGGED_IN', 'Already logged in')
  })

  const response = await fetch(API)
  t.is(response.status, 403)
  t.alike(await response.json(), { error: 403, code: 'ALREADY_LOGGED_IN', message: 'Already logged in' })
})

test('validation error', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    const err = new Error('Invalid email format')
    err.name = 'ValidationError' // For example, "yup" (lib) error
    throw err
  })

  const response = await fetch(API)
  t.is(response.status, 400)
  t.alike(await response.json(), { error: 400, message: 'Invalid email format' })
})

test('critical error', async function (t) {
  t.plan(2)

  const API = create(t, function (req, res) {
    throw new SyntaxError('Some syntax error')
  })

  const response = await fetch(API)
  t.is(response.status, 500)
  t.alike(await response.json(), { error: 500, code: 'INTERNAL', message: 'Internal error' })
})

test('async', async function (t) {
  t.plan(2)

  const API = create(t, async function (req, res) {
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new ErrorHTTP(400, 'ALREADY_REGISTERED')
  })

  const response = await fetch(API)
  t.is(response.status, 400)
  t.alike(await response.json(), { error: 400, code: 'ALREADY_REGISTERED', message: '' })
})

test('yup', async function (t) {
  t.plan(2)

  const API = create(t, async function (req, res) {
    await schema.validate({ password: '12345' })
  })

  const response = await fetch(API)
  t.is(response.status, 400)
  t.alike(await response.json(), { error: 400, message: 'password must be at most 4 characters' })
})

function create (t, handler) {
  const app = express()

  app.get('/', handler)
  app.use(ErrorHTTP.middleware)

  const server = app.listen(0)
  t.teardown(() => new Promise(resolve => server.close(resolve)))

  return 'http://127.0.0.1:' + server.address().port + '/'
}

var Web3 = require('web3')
var isEqual = require('lodash.isequal')

const extractToken = req => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  } else {
    return null
  }
}

var base64Decode = data => {
  const buff = Buffer.from(data, 'base64')
  return buff.toString('utf-8')
}

const validateHeaders = headers => {
  return headers.alg && headers.typ && headers.typ == 'JWT'
}

const validatePayload = (payload, signee) => {
  if (payload.lock) {
    return payload.lock.owner == signee
  } else {
    return payload.owner == signee
  }
}
const validatePayloadClaims = (payload, signee) => {
  if (payload.iss && payload.iat && payload.exp) {
    const selfSigned = payload.iss == signee
    const validTokenRange = payload.exp - payload.iat == 3
    const recentlyIssued = Math.abs(Date.now() / 1000 - payload.iat) < 5
    return selfSigned && validTokenRange && recentlyIssued
  } else {
    return false
  }
}

const validatePayloadBodyMatch = (payload, body) => {
  const reservedFields = ['iat', 'exp', 'iss']
  const bodyPrune = ['pending']

  var workingPayload

  if (payload.lock) {
    workingPayload = payload.lock
  } else {
    workingPayload = payload
  }

  reservedFields.forEach(reservedField => {
    delete workingPayload[reservedField]
  })

  bodyPrune.forEach(prune => {
    delete body[prune]
  })

  return isEqual(workingPayload, body)
}

function process(req, res, next) {
  var web3 = new Web3(null)
  var token = extractToken(req)

  if (token == null) {
    res.sendStatus(401)
    return
  }

  var [header, payload, signature] = token.split('.')

  try {
    var parsedHeaders = JSON.parse(base64Decode(header))
  } catch (e) {
    res.sendStatus(401)
    return
  }

  try {
    var parsedPayload = JSON.parse(base64Decode(payload))
  } catch (e) {
    res.sendStatus(401)
    return
  }

  const signingAddress = web3.eth.accounts.recover(
    `${header}.${payload}`,
    signature
  )

  if (
    validateHeaders(parsedHeaders) &&
    validatePayload(parsedPayload, signingAddress) &&
    validatePayloadClaims(parsedPayload, signingAddress) &&
    validatePayloadBodyMatch(parsedPayload, req.body)
  ) {
    req.owner = signingAddress
    next()
  } else {
    res.sendStatus(401)
    return
  }
}

module.exports = process

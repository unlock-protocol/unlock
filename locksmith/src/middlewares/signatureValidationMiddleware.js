var sigUtil = require('eth-sig-util')
const ethJsUtil = require('ethereumjs-util')
const Base64 = require('../utils/base64')

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

const validatePayload = (payload, signee) => {
  if (payload.lock) {
    return (
      ethJsUtil.toChecksumAddress(payload.lock.owner) ===
      ethJsUtil.toChecksumAddress(signee)
    )
  } else {
    return false
  }
}
const validatePayloadContent = payload => {
  if (payload.lock) {
    if (payload.lock.name && payload.lock.owner && payload.lock.address) {
      return true
    }
  }
  return false
}

function process(req, res, next) {
  var signature = extractToken(req)

  if (signature === null) {
    res.sendStatus(401)
    return
  }

  let decodedSignature = Base64.decode(signature)

  try {
    let signee = sigUtil.recoverTypedSignature({
      data: req.body,
      sig: decodedSignature,
    })

    if (
      req.body.message &&
      validatePayload(req.body.message, signee) &&
      validatePayloadContent(req.body.message)
    ) {
      req.owner = ethJsUtil.toChecksumAddress(signee)
      next()
    } else {
      res.sendStatus(401)
      return
    }
  } catch (e) {
    res.sendStatus(401)
  }
}

module.exports = process

var jwt = require('jsonwebtoken')

export default function generateJWTToken(walletService, address, data) {
  let payload = jwt.sign(data, null, {
    algorithm: 'none',
    issuer: address,
    expiresIn: '3s',
  })

  payload = payload.substring(0, payload.length - 1)

  return new Promise((resolve, reject) => {
    walletService.signData(address, payload, (error, signature) => {
      if (signature) {
        resolve(`${payload}.${signature}`)
      } else {
        reject(error)
      }
    })
  })
}

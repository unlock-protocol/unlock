import sigUtil from 'eth-sig-util'
import ethJsUtil from 'ethereumjs-util'
import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Base64 from '../utils/base64'

namespace SignatureValidationMiddleware {
  const extractToken = (req: Request): String | null => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return req.headers.authorization.split(' ')[1]
    } else {
      return null
    }
  }

  const validatePayload = (payload: any, signee: string): Boolean => {
    if (payload.lock) {
      return (
        ethJsUtil.toChecksumAddress(payload.lock.owner) ===
        ethJsUtil.toChecksumAddress(signee)
      )
    } else {
      return false
    }
  }
  const validatePayloadContent = (payload: any): Boolean => {
    if (payload.lock) {
      if (payload.lock.name && payload.lock.owner && payload.lock.address) {
        return true
      }
    }
    return false
  }

  export const process = (req: any, res: Response, next: any) => {
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
}

export default SignatureValidationMiddleware.process

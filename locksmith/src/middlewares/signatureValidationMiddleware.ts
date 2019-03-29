import sigUtil from 'eth-sig-util'
import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Base64 from '../utils/base64'
import Normalizer from '../utils/normalizer'
import { SignatureValidationConfiguration } from '../types' // eslint-disable-line no-unused-vars

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

  const validateSignee = (payload: any, signee: string): Boolean => {
    return (
      Normalizer.ethereumAddress(payload) === Normalizer.ethereumAddress(signee)
    )
  }

  const validatePayloadContent = (
    payload: any,
    configuration: SignatureValidationConfiguration
  ): Boolean => {
    let result = configuration.required.every(element => {
      return !(payload[element] == null)
    })

    return result
  }

  const handleSignaturePresent = (
    body: any,
    signature: string,
    configuration: SignatureValidationConfiguration
  ) => {
    try {
      let signee = sigUtil.recoverTypedSignature({
        data: body,
        sig: signature,
      })

      let potentialSignee: string =
        body.message[configuration.name][configuration.signee]

      if (
        body.message &&
        validateSignee(potentialSignee, signee) &&
        validatePayloadContent(body.message[configuration.name], configuration)
      ) {
        return Normalizer.ethereumAddress(signee)
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  }

  export const generateProcessor = (
    configuration: SignatureValidationConfiguration
  ): Function => {
    return (req: any, res: Response, next: any) => {
      var signature = extractToken(req)

      if (signature === null) {
        res.sendStatus(401)
        return
      } else {
        let decodedSignature = Base64.decode(signature)
        let owner = handleSignaturePresent(
          req.body,
          decodedSignature,
          configuration
        )

        if (owner) {
          req.owner = owner
          next()
        } else {
          res.sendStatus(401)
          return
        }
      }
    }
  }
}

export default SignatureValidationMiddleware

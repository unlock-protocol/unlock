import sigUtil from 'eth-sig-util'
import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import * as Base64 from '../utils/base64'
import Normalizer from '../utils/normalizer'
import { SignatureValidationConfiguration } from '../types' // eslint-disable-line no-unused-vars

namespace SignatureValidationMiddleware {
  const extractTypeDataSignee = (header: string, body: string) => {
    let decodedSignature = Base64.decode(header)

    try {
      return sigUtil.recoverTypedSignature({
        data: body,
        sig: decodedSignature,
      })
    } catch {
      return null
    }
  }

  const extractPersonalSignSignee = (header: string, body: string) => {
    let decodedSignature = Base64.decode(header)

    try {
      return sigUtil.recoverPersonalSignature({
        data: JSON.stringify(body),
        sig: decodedSignature,
      })
    } catch {
      return null
    }
  }

  const extractSignee = (req: Request): string | null => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      let header = req.headers.authorization.split(' ')[1]

      return extractTypeDataSignee(header, req.body)
    } else if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer-Simple'
    ) {
      let header = req.headers.authorization.split(' ')[1]
      return extractPersonalSignSignee(header, req.body)
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
      let signee = signature
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

  /**
   *  Generates a function that will validate the validity of a signature
   * based on the structure provide by the passed configuration object.
   *
   * @param {SignatureValidationConfiguration} configuration - A configuration object providing
   * details about the structure of the signed message.
   */

  export const generateProcessor = (
    configuration: SignatureValidationConfiguration
  ): any => {
    return (req: any, res: Response, next: any) => {
      var signature = extractSignee(req)

      if (signature === null) {
        res.sendStatus(401)
        return
      } else {
        let owner = handleSignaturePresent(req.body, signature, configuration)

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

  export const generateSignatureEvaluator = (
    configuration: SignatureValidationConfiguration
  ): any => {
    return (req: any, _res: Response, next: any) => {
      var signature = extractSignee(req)

      if (signature === null) {
        next()
      } else {
        let signee = handleSignaturePresent(req.body, signature, configuration)

        if (signee) {
          req.signee = signee
        }
        next()
      }
    }
  }
}

export default SignatureValidationMiddleware

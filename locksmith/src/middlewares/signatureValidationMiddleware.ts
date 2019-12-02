import sigUtil from 'eth-sig-util'
import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import * as Base64 from '../utils/base64'
import Normalizer from '../utils/normalizer'
import { SignatureValidationConfiguration } from '../types' // eslint-disable-line no-unused-vars

namespace SignatureValidationMiddleware {
  const extractQueryParameterPayload = (payload: string) => {
    return JSON.parse(decodeURIComponent(payload))
  }

  const extractTypeDataSignee = (header: string, body: any) => {
    const decodedSignature = Base64.decode(header)

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
    const decodedSignature = Base64.decode(header)

    try {
      return sigUtil.recoverPersonalSignature({
        data: JSON.stringify(body),
        sig: decodedSignature,
      })
    } catch {
      return null
    }
  }

  const extractSigneeFromSource = (
    req: Request,
    source: string
  ): string | null => {
    if (!source) {
      return null
    }

    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      const header = req.headers.authorization.split(' ')[1]
      return extractTypeDataSignee(header, source)
    }
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer-Simple'
    ) {
      const header = req.headers.authorization.split(' ')[1]
      return extractPersonalSignSignee(header, source)
    }
    return null
  }

  const extractSignee = (req: Request): string | null => {
    return extractSigneeFromSource(req, req.body)
  }

  const extractSigneeFromQueryParameter = (
    req: Request,
    source: string
  ): string | null => {
    try {
      const data = extractQueryParameterPayload(source)
      return extractSigneeFromSource(req, data)
    } catch {
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
    const result = configuration.required.every(element => {
      return !(payload[element] == null)
    })

    return result
  }

  const handleSignaturePresent = (
    body: any,
    signee: string,
    configuration: SignatureValidationConfiguration
  ) => {
    try {
      const potentialSignee: string =
        body.message[configuration.name][configuration.signee]

      if (
        body.message &&
        validateSignee(potentialSignee, signee) &&
        validatePayloadContent(body.message[configuration.name], configuration)
      ) {
        return Normalizer.ethereumAddress(signee)
      }
      return null
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
      const signature = extractSignee(req)

      if (signature === null) {
        res.sendStatus(401)
      } else {
        const owner = handleSignaturePresent(req.body, signature, configuration)

        if (owner) {
          req.owner = owner
          next()
        } else {
          res.sendStatus(401)
        }
      }
    }
  }

  export const generateSignatureEvaluator = (
    configuration: SignatureValidationConfiguration
  ): any => {
    return (req: any, _res: Response, next: any) => {
      const signature = extractSigneeFromQueryParameter(req, req.query.data)

      if (signature === null) {
        next()
      } else {
        const payload = extractQueryParameterPayload(req.query.data)
        const signee = handleSignaturePresent(payload, signature, configuration)
        if (signee) {
          req.signee = signee
        }
        next()
      }
    }
  }
}

export default SignatureValidationMiddleware

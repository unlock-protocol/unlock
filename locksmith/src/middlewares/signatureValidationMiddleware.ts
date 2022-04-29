import * as sigUtil from 'eth-sig-util'
import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import * as Base64 from '../utils/base64'
import Normalizer from '../utils/normalizer'
import { SignatureValidationConfiguration } from '../types'

import logger from '../logger'

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
    } catch (error) {
      logger.error('Failed to extractTypeDataSignee', error)
      return null
    }
  }

  const extractPersonalSignSignee = (header: string, data: string) => {
    const decodedSignature = Base64.decode(header)

    try {
      return sigUtil.recoverPersonalSignature({
        data,
        sig: decodedSignature,
      })
    } catch (error) {
      logger.error('Failed to extractPersonalSignSignee', error)
      return null
    }
  }

  const extractSigneeFromSource = (
    req: Request,
    source: any
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
    } else if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer-Simple'
    ) {
      let data = JSON.stringify(source)
      // Overrides of the content which has been signed because it is better for UX to sign strings than JSON objects.
      if (source.message?.UserMetaData) {
        data = `I am signing the metadata for the lock at ${req.params.address}`
      }
      if (source.message?.LockMetaData) {
        data = `I want to access member data for ${req.params.address}`
      }
      if (source.message && source.message['Update Icon']) {
        data = `I want to change the image for ${source.message['Update Icon'].lockAddress}`
      }
      if (source.message && source.message['Connect Stripe']) {
        data = `I want to connect Stripe to the lock ${source.message['Connect Stripe'].lockAddress}`
      }
      if (source.message && source.message['Save Card']) {
        data = `I save my payment card for my account ${source.message['Save Card'].publicKey}`
      }
      if (source.message && source.message['Delete Card']) {
        data = `I am deleting the card linked to my account ${source.message['Delete Card'].publicKey}`
      }
      if (source.message && source.message['Get Card']) {
        data = `I want to retrieve the card token for ${source.message['Get Card'].publicKey}`
      }
      if (source.message && source.message['Charge Card']) {
        data = `I want to purchase a membership to ${source.message['Charge Card'].lock} for ${source.message['Charge Card'].publicKey} with my card.`
      }
      if (source.message && source.message['Claim Membership']) {
        data = `I claim a membership for ${source.message['Claim Membership'].lock} to ${source.message['Claim Membership'].publicKey}`
      }

      const header = req.headers.authorization.split(' ')[1]
      return extractPersonalSignSignee(header, data)
    } else {
      logger.error('Missing Authorization header. ')
    }

    return null
  }

  const extractSignee = (req: Request): string | null => {
    return extractSigneeFromSource(req, req.body)
  }

  const extractSigneeFromQueryParameter = (
    req: Request,
    source: any
  ): string | null => {
    try {
      const data = extractQueryParameterPayload(source)
      return extractSigneeFromSource(req, data)
    } catch (error) {
      logger.error('Failed to extractSigneeFromQueryParameter', error)
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
    const result = configuration.required.every((element) => {
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
    } catch (error) {
      logger.error('Failed to handleSignaturePresent', error)
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
      const signer = extractSignee(req)
      if (signer === null) {
        res.status(401).send('missing signer')
      } else {
        const owner = handleSignaturePresent(req.body, signer, configuration)
        if (owner) {
          req.owner = owner
          next()
        } else {
          res.status(401).send('signature does not match')
        }
      }
    }
  }

  export const generateSignatureEvaluator = (
    configuration: SignatureValidationConfiguration
  ): any => {
    return (req: any, _res: Response, next: any) => {
      if (req.query.data) {
        const signer = extractSigneeFromQueryParameter(req, req.query.data)
        if (signer) {
          const payload = extractQueryParameterPayload(req.query.data)
          const signee = handleSignaturePresent(payload, signer, configuration)
          if (signee) {
            req.signee = signee
          }
        }
        next()
      } else {
        next()
      }
    }
  }
}

export default SignatureValidationMiddleware

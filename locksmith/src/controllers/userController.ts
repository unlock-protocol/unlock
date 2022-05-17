import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { DecoyUser } from '../utils/decoyUser'
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import * as StripeOperations from '../operations/stripeOperations'
import * as Normalizer from '../utils/normalizer'

import UserOperations = require('../operations/userOperations')

import logger from '../logger'

namespace UserController {
  export const createUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { user } = req.body.message

      if (user) {
        const { emailAddress } = user
        const ejected = await UserOperations.ejectionStatus(emailAddress)

        if (ejected) {
          return res.sendStatus(409)
        }
        const creationStatus = await userCreationStatus(user)
        const { recoveryPhrase } = creationStatus

        return res.status(creationStatus.status).json({ recoveryPhrase })
      }
      return res.sendStatus(400)
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json(error.errors)
      } else {
        logger.error('Failed to create user', error)
        return res.sendStatus(400)
      }
    }
  }

  const userCreationStatus = async (user: any): Promise<any> => {
    const recoveryPhrase: String | undefined = await UserOperations.createUser({
      emailAddress: user.emailAddress,
      publicKey: user.publicKey,
      passwordEncryptedPrivateKey: user.passwordEncryptedPrivateKey,
    })

    const status = recoveryPhrase ? 200 : 400
    return { status, recoveryPhrase }
  }

  export const retrieveEncryptedPrivatekey = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { emailAddress } = req.params
    const ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    }
    const result = await UserOperations.getUserPrivateKeyByEmailAddress(
      emailAddress
    )

    if (result) {
      return res.json({ passwordEncryptedPrivateKey: result })
    } else {
      const result = await new DecoyUser().encryptedPrivateKey()

      return res.json({
        passwordEncryptedPrivateKey: result,
      })
    }
  }

  export const retrieveRecoveryPhrase = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { emailAddress } = req.params
    const ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    }
    const result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
      emailAddress
    )

    if (result) {
      return res.json({ recoveryPhrase: result })
    }
    const recoveryPhrase = new DecoyUser().recoveryPhrase()
    return res.json({ recoveryPhrase })
  }

  export const updateUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { emailAddress } = req.params
    const { user } = req.body.message
    const ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    }
    try {
      const result = await UserOperations.updateEmail(
        emailAddress,
        user.emailAddress
      )

      if (result[0] == 0) {
        return res.sendStatus(400)
      }
      return res.sendStatus(202)
    } catch (error) {
      return res.sendStatus(400)
    }
  }

  export const updatePaymentDetails = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { publicKey } = req.body.message.user
    const { emailAddress } = req.params
    const token = req.body.message.user.stripeTokenId
    const ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    }
    const result = await UserOperations.updatePaymentDetails(token, publicKey)

    if (result) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const updateAddressPaymentDetails = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { ethereumAddress } = req.params

    if (ethereumAddress == null) {
      return res.sendStatus(401)
    } else if (ethereumAddress != req.owner) {
      return res.sendStatus(401)
    }
    const token = req.body.message['Save Card'].stripeTokenId

    const result = await UserOperations.updatePaymentDetails(
      token,
      ethereumAddress
    )

    if (result) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const getAddressPaymentDetails = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { ethereumAddress } = req.params
    let data = {}
    if (req?.query?.data) {
      data = JSON.parse(req.query.data as string)
    }

    if (!ethereumAddress || !req.signee) {
      return res.sendStatus(401)
    } else if (
      Normalizer.ethereumAddress(ethereumAddress) !==
      Normalizer.ethereumAddress(req.signee)
    ) {
      return res.sendStatus(401)
    }

    const stripeCustomerId =
      await StripeOperations.getStripeCustomerIdForAddress(
        ethereumAddress,
        // @ts-expect-error
        data?.message?.stripeApiKey || ''
      )
    if (!stripeCustomerId) {
      return res.json([])
    }
    const result = await UserOperations.getCardDetailsFromStripe(
      stripeCustomerId
    )

    return res.json(result)
  }

  export const deleteAddressPaymentDetails = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { ethereumAddress } = req.params

    if (!ethereumAddress || !req.signee) {
      return res.sendStatus(401)
    } else if (
      Normalizer.ethereumAddress(ethereumAddress) !==
      Normalizer.ethereumAddress(req.signee)
    ) {
      return res.sendStatus(401)
    }

    const result = await StripeOperations.deletePaymentDetailsForAddress(
      ethereumAddress
    )

    if (result) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const updatePasswordEncryptedPrivateKey = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { user } = req.body.message
    const { publicKey } = user
    const { passwordEncryptedPrivateKey } = user

    const ejected = await UserOperations.ejectionStatusByAddress(publicKey)

    if (ejected) {
      return res.sendStatus(404)
    }

    const result = await UserOperations.updatePasswordEncryptedPrivateKey(
      publicKey,
      passwordEncryptedPrivateKey
    )

    if (result[0] != 0) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const cards = async (req: Request, res: Response) => {
    const { emailAddress } = req.params
    const result = await UserOperations.getCards(emailAddress)
    return res.json(result)
  }

  export const eject = async (req: SignedRequest, res: Response) => {
    const address = req.params.ethereumAddress
    const ejected = await UserOperations.ejectionStatusByAddress(address)

    if (address.toLowerCase() != req.owner.toLowerCase()) {
      return res.sendStatus(401)
    }

    if (ejected) {
      return res.sendStatus(400)
    }

    const result = await UserOperations.eject(address)

    if (result[0] > 0) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const exist = async (request: Request, response: Response) => {
    const { emailAddress } = request.params
    const user = await UserOperations.findByEmail(emailAddress)

    if (!user) {
      return response.sendStatus(404)
    }
    return response.sendStatus(200)
  }
}

export = UserController

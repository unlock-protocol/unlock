import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { DecoyUser } from '../utils/decoyUser'
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import StripeOperations from '../operations/stripeOperations'

import UserOperations = require('../operations/userOperations')

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
    } catch (e) {
      return res.sendStatus(400)
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
    req: Request,
    res: Response
  ): Promise<any> => {
    const { ethereumAddress } = req.params
    const token = req.body.message.user.stripeTokenId
    const result = await StripeOperations.saveStripeCustomerIdForAddress(
      ethereumAddress,
      token
    )

    if (result) {
      return res.sendStatus(202)
    }
    return res.sendStatus(400)
  }

  export const getAddressPaymentDetails = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const { ethereumAddress } = req.params
    const stripeCustomerId = await StripeOperations.getStripeCustomerIdForAddress(
      ethereumAddress
    )
    if (!stripeCustomerId) {
      return res.json([])
    }
    const result = await UserOperations.getCardDetailsFromStripe(
      stripeCustomerId
    )

    return res.json(result)
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
}

export = UserController

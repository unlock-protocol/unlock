import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { DecoyUser } from '../utils/decoyUser'

import UserOperations = require('../operations/userOperations')

namespace UserController {
  export const createUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      let user = req.body.message.user

      if (user) {
        let emailAddress = user.emailAddress
        let ejected = await UserOperations.ejectionStatus(emailAddress)

        if (ejected) {
          return res.sendStatus(409)
        } else {
          let creationStatus = await userCreationStatus(user)
          let recoveryPhrase = creationStatus.recoveryPhrase

          return res.status(creationStatus.status).json({ recoveryPhrase })
        }
      } else {
        return res.sendStatus(400)
      }
    } catch (e) {
      return res.sendStatus(400)
    }
  }

  const userCreationStatus = async (user: any): Promise<any> => {
    let recoveryPhrase: String | undefined = await UserOperations.createUser({
      emailAddress: user.emailAddress,
      publicKey: user.publicKey,
      passwordEncryptedPrivateKey: user.passwordEncryptedPrivateKey,
    })

    let status = recoveryPhrase ? 200 : 400
    return { status, recoveryPhrase }
  }

  export const retrieveEncryptedPrivatekey = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
    let ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    } else {
      let result = await UserOperations.getUserPrivateKeyByEmailAddress(
        emailAddress
      )

      if (result) {
        return res.json({ passwordEncryptedPrivateKey: result })
      } else {
        let result = await new DecoyUser().encryptedPrivateKey()

        return res.json({
          passwordEncryptedPrivateKey: result,
        })
      }
    }
  }

  export const retrieveRecoveryPhrase = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
    let ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    } else {
      let result = await UserOperations.getUserRecoveryPhraseByEmailAddress(
        emailAddress
      )

      if (result) {
        return res.json({ recoveryPhrase: result })
      } else {
        let recoveryPhrase = new DecoyUser().recoveryPhrase()
        return res.json({ recoveryPhrase: recoveryPhrase })
      }
    }
  }

  export const updateUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
    let user = req.body.message.user
    let ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    } else {
      try {
        let result = await UserOperations.updateEmail(
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
  }

  export const updatePaymentDetails = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let publicKey = req.body.message.user.publicKey
    let emailAddress = req.params.emailAddress
    let token = req.body.message.user.stripeTokenId

    let ejected = await UserOperations.ejectionStatus(emailAddress)

    if (ejected) {
      return res.sendStatus(404)
    } else {
      let result = await UserOperations.updatePaymentDetails(token, publicKey)

      if (result) {
        return res.sendStatus(202)
      } else {
        return res.sendStatus(400)
      }
    }
  }

  export const updatePasswordEncryptedPrivateKey = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let user = req.body.message.user
    let publicKey = user.publicKey
    let passwordEncryptedPrivateKey = user.passwordEncryptedPrivateKey

    let result = await UserOperations.updatePasswordEncryptedPrivateKey(
      publicKey,
      passwordEncryptedPrivateKey
    )

    if (result[0] != 0) {
      return res.sendStatus(202)
    } else {
      return res.sendStatus(400)
    }
  }

  export const cards = async (req: Request, res: Response) => {
    let emailAddress = req.params.emailAddress
    let result = await UserOperations.getCards(emailAddress)
    return res.json(result)
  }

  export const eject = async (req: Request, res: Response) => {
    let address = req.params.ethereumAddress
    let result = await UserOperations.eject(address)

    if (result[0] > 0) {
      return res.sendStatus(202)
    } else {
      return res.sendStatus(400)
    }
  }
}

export = UserController

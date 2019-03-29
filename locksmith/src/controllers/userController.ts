import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { DecoyUser } from '../utils/decoyUser'

import RecoveryPhrase = require('../utils/recoveryPhrase')
import UserOperations = require('../operations/userOperations')

namespace UserController {
  export const createUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let user = req.body.user

    try {
      if (user) {
        let creationStatus: Boolean = await UserOperations.createUser({
          emailAddress: user.emailAddress,
          publicKey: user.publicKey,
          passwordEncryptedPrivateKey: user.passwordEncryptedPrivateKey,
          recoveryPhrase: RecoveryPhrase.generate(),
        })

        let status = creationStatus ? 200 : 400
        return res.sendStatus(status)
      }
    } catch (e) {
      return res.sendStatus(400)
    }
  }

  export const retrieveEncryptedPrivatekey = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
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

  export const retrieveRecoveryPhrase = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
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

  export const updateUser = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let emailAddress = req.params.emailAddress
    let user = req.body.user

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

export = UserController

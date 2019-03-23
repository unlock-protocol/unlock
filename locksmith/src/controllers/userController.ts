import UserOperations = require('../operations/userOperations')
import { Request, Response } from 'express-serve-static-core'

namespace UserController {
  export async function createUser(req: Request, res: Response): Promise<any> {
    let user = req.body.user

    try {
      if (user) {
        let creationStatus: Boolean = await UserOperations.createUser({
          emailAddress: user.emailAddress,
          publicKey: user.publicKey,
          passwordEncryptedPrivateKey: user.passwordEncryptedPrivateKey,
          recoveryPhrase: user.recoveryPhrase,
        })

        let status = creationStatus ? 200 : 400
        return res.sendStatus(status)
      }
    } catch (e) {
      return res.sendStatus(400)
    }
  }

  export async function retrieveEncryptedPrivatekey(
    req: Request,
    res: Response
  ): Promise<any> {
    let emailAddress = req.params.emailAddress
    let result = await UserOperations.getUserPrivateKeyByEmailAddress(
      emailAddress
    )

    if (result) {
      return res.json({ passwordEncryptedPrivateKey: result })
    } else {
      return res.sendStatus(400)
    }
  }

  export async function retrieveRecoveryPhrase(
    req: Request,
    res: Response
  ): Promise<any> {
    let emailAddress = req.params.emailAddress
    let result = await UserOperations.getUserRecoveryPhraseByEmailAddress(emailAddress)


    if (result) {
      return res.json({ recoveryPhrase: result })
    } else {
      return res.sendStatus(400)
    }
  }
}

export = UserController

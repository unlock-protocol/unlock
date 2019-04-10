import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import AuthorizedLockOperations from '../operations/authorizedLockOperations'

namespace PurchaseController {
  //eslint-disable-next-line import/prefer-default-export
  export const purchase = async (req: Request, res: Response): Promise<any> => {
    let currentTime = Math.floor(Date.now() / 1000)
    const expiry = req.body.message.purchaseRequest.expiry
    const lockAddress = req.body.message.purchaseRequest.lock

    if (expiry < currentTime) {
      return res.sendStatus(412)
    }

    if (!(await AuthorizedLockOperations.hasAuthorization(lockAddress))) {
      return res.sendStatus(451)
    }

    return res.sendStatus(202)
  }
}

export = PurchaseController

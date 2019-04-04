import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace PurchaseController {
  //eslint-disable-next-line import/prefer-default-export
  export const purchase = async (
    _req: Request,
    res: Response
  ): Promise<any> => {
    return res.sendStatus(202)
  }
}

export = PurchaseController

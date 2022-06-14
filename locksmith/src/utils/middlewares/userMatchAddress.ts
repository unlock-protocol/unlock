import { RequestHandler } from 'express'
import Normalizer from '../../utils/normalizer'

export const userMatchAddress: RequestHandler = async (req, res, next) => {
  const address = Normalizer.ethereumAddress(req.params.verifierAddress)
  const verifierMatchesLoggedUser = req.user?.walletAddress === address

  if (!verifierMatchesLoggedUser) {
    return res.status(401).send({
      message: `User not authorized`,
    })
  }
  return next()
}

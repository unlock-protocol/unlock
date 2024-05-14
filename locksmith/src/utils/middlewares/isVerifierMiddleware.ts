import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { logger } from '@sentry/utils'
import { Verifier } from '../../models/verifier'
import { getEventForLock } from '../../operations/eventOperations'
import { CheckoutConfig } from '../../models'
import { getEventVerifiers } from '../../operations/verifierOperations'

export const isVerifierOrManagerForLock = async (
  lockAddress: string,
  address: string,
  network: number
) => {
  let isLockManager = false

  const verifier = await Verifier.findOne({
    where: {
      lockAddress,
      address,
      network,
    },
  })

  if (!verifier) {
    const web3Service = new Web3Service(networks)
    isLockManager = await web3Service.isLockManager(
      lockAddress,
      address,
      network
    )
  }
  return verifier?.id !== undefined || isLockManager
}

export const isVerifierMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const network = Number(req.params.network)
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const address = Normalizer.ethereumAddress(req.user!.walletAddress!)

    if (await isVerifierOrManagerForLock(lockAddress, address, network)) {
      return next()
    } else {
      //Check if the user is a verifier or a manager for any of the locks in checkoutConfig
      const event = await getEventForLock(lockAddress, network, false)

      if (event) {
        const eventVerifiers = await getEventVerifiers(event?.slug as string)

        const isVerifier = eventVerifiers
          ?.map((item) => Normalizer.ethereumAddress(item.address))
          .includes(Normalizer.ethereumAddress(address))

        if (isVerifier) return next()
      }

      return res.status(403).send({
        message: `${address} is not a verifier of from ${lockAddress} on ${network}`,
      })
    }
  } catch (err) {
    logger.error(err)
    return res.status(500).send({
      message:
        'There is some unexpected issue when checking if the user is a verifier or manager.',
    })
  }
}

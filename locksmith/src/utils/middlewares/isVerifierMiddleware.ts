import networks from '@unlock-protocol/networks'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { RequestHandler } from 'express'
import Normalizer from '../normalizer'
import { logger } from '@sentry/utils'
import { Verifier } from '../../models/verifier'
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

// TODO: Depraecate this middleware
export const isLockVerifierMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const network = Number(req.params.network)
    const lockAddress = Normalizer.ethereumAddress(req.params.lockAddress)
    const address = Normalizer.ethereumAddress(req.user!.walletAddress!)

    if (await isVerifierOrManagerForLock(lockAddress, address, network)) {
      return next()
    } else {
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

export const isEventVerifierMiddleware: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const eventSlug = req.params.eventSlug
    console.log('Event Slug', eventSlug)
    const address = Normalizer.ethereumAddress(req.user!.walletAddress!)

    const eventVerifiers = await getEventVerifiers(eventSlug)

    const isVerifier = eventVerifiers
      ?.map((item) => Normalizer.ethereumAddress(item.address))
      .includes(Normalizer.ethereumAddress(address))

    if (isVerifier) {
      // The user is verifier for the event
      return next()
    } else {
      return res.status(403).send({
        message: `${address} is not a verifier of the event`,
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

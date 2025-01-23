import { Request, RequestHandler, Response } from 'express'
import Dispatcher from '../../fulfillment/dispatcher'
import { notifyNewKeyToWedlocks } from '../../operations/wedlocksOperations'
import Normalizer from '../../utils/normalizer'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import logger from '../../logger'
import { generateQrCode, generateQrCodeUrl } from '../../utils/qrcode'
import { KeyMetadata } from '../../models/keyMetadata'
import { createTicket } from '../../utils/ticket'
import { generateKeyMetadata } from '../../operations/metadataOperations'
import config from '../../config/config'
import {
  getEventVerifiers,
  getVerifiersListForLock,
} from '../../operations/verifierOperations'
import { Verifier } from '../../models/verifier'
import { getEventForLock } from '../../operations/eventOperations'
import { notify } from '../../worker/helpers'
import { getWeb3Service } from '../../initializers'

export class TicketsController {
  /**
   * API to generate signatures that prove validity of a token
   * @param request
   * @param response
   * @returns
   */
  async sign(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const tokenId = request.params.keyId

    const dispatcher = new Dispatcher()
    const [payload, signature] = await dispatcher.signToken(
      network,
      lockAddress,
      tokenId
    )
    response.status(200).send({ payload, signature })
  }

  /**
   * This will mark a ticket as check-in, this operation is only allowed for a lock verifier of a lock manager
   * @param {Request} request
   * @param {Response} response
   * @return
   */
  async markTicketAsCheckIn(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const id = request.params.keyId.toLowerCase()
      const address = Normalizer.ethereumAddress(request.user!.walletAddress!)
      // event slug is used by /:network/lock/:lockAddress/:eventSlug/key/:keyId/check' route
      const eventSlug = request.params.eventSlug
      const verifier = eventSlug
        ? await Verifier.findOne({
            where: {
              address,
              slug: eventSlug,
            },
          })
        : await Verifier.findOne({
            where: {
              address,
              lockAddress,
              network,
            },
          })

      const keyMetadata = await KeyMetadata.findOne({
        where: {
          id,
          address: lockAddress,
        },
      })

      const data = keyMetadata?.data as unknown as {
        metadata: {
          checkedInAt: number | number[] | { at: number; verifierName: string }
        }
      }

      const checkedInAt = []
      if (!data?.metadata?.checkedInAt) {
        checkedInAt.push(new Date().getTime())
      } else if (typeof data?.metadata?.checkedInAt === 'number') {
        checkedInAt.push(data?.metadata?.checkedInAt, new Date().getTime())
      } else if (Array.isArray(data?.metadata?.checkedInAt)) {
        if (verifier?.name) {
          checkedInAt.push(...data.metadata.checkedInAt, {
            at: new Date().getTime(),
            verifierName: verifier.name,
          })
        } else {
          checkedInAt.push(...data.metadata.checkedInAt, new Date().getTime())
        }
      }

      await KeyMetadata.upsert(
        {
          id,
          chain: network,
          address: lockAddress,
          data: {
            ...data,
            metadata: {
              ...data?.metadata,
              checkedInAt,
            },
          },
        },
        {
          returning: true,
          conflictFields: ['id', 'address'],
        }
      )

      const event = await getEventForLock(
        lockAddress,
        network,
        true /** includeProtected */
      )

      const web3Service = getWeb3Service()
      const tokenOwner = await web3Service.ownerOf(lockAddress, id, network)

      if (event?.data.notifyCheckInUrls) {
        for (const url of event.data.notifyCheckInUrls) {
          const response = await notify({
            hookCallback: url,
            body: {
              ownerAddress: tokenOwner,
              lockAddress,
              network,
              tokenId: id,
              verifier: {
                address: request.user!.walletAddress!,
                name: verifier?.name,
              },
            },
          })
          if (response.status !== 200) {
            logger.info(
              `Received unxpected response when notifying ${url}: ${
                response.status
              } ${await response.text()}`
            )
          }
        }
      }

      response.status(202).send({
        message: 'Ticket checked in',
      })
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
        error: 'Could not mark ticket as checked in',
      })
      return
    }
  }

  /**
   * API call to send an QR code by email. This can only be called by a lock manager
   * @param request
   * @param response
   * @returns
   */
  async sendEmail(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const keyId = request.params.keyId.toLowerCase()
      const subgraph = new SubgraphService()
      const key = await subgraph.key(
        {
          where: {
            lock: lockAddress.toLowerCase(),
            tokenId: keyId,
          },
        },
        {
          network,
        }
      )

      if (!key) {
        response.status(404).send({
          message: 'No key found for this lock and keyId',
        })
        return
      }

      const sent = await notifyNewKeyToWedlocks(
        {
          tokenId: keyId,
          lock: {
            address: lockAddress,
            name: key.lock.name || 'Unlock Lock',
          },
          manager: key.manager,
          owner: key.owner,
        },
        network
      )
      response.status(200).send({
        sent,
      })
      return
    } catch (err) {
      logger.error(err.message)
      response.sendStatus(500)
      return
    }
  }

  /**
   * Function that serves a QR code.
   * It can only be called by a lock manager (otherwise anyone can create a valid QR code that will be used to check-in!)
   * @param request
   * @param response
   * @returns
   */
  async getQrCode(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const tokenId = request.params.keyId.toLowerCase()

      const qrCode = (
        await generateQrCode({
          network,
          lockAddress,
          tokenId,
        })
      ).replace('data:image/gif;base64,', '')
      const img = Buffer.from(qrCode, 'base64')

      response.writeHead(200, {
        'Content-Type': 'image/gif',
      })
      response.end(img)
      return
    } catch (err) {
      logger.error(err)
      response.sendStatus(500).send({
        message: 'Failed to generate QR code',
      })
      return
    }
  }

  /**
   * gets the URL for the verification (which can also be rendered as QR code)
   * @param request
   * @param response
   * @returns
   */
  async getVerificationUrl(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const tokenId = request.params.keyId.toLowerCase()

      const verificationUrl = await generateQrCodeUrl({
        network,
        lockAddress,
        tokenId,
      })

      response.status(200).send({
        verificationUrl,
      })
      return
    } catch (err) {
      logger.error(err)
      response.status(500).send({
        message: 'Failed to generate QR code',
      })
      return
    }
  }
}

export const generateTicket: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const tokenId = request.params.keyId.toLowerCase()
  const subgraph = new SubgraphService()
  const loggedInUser = request.user!.walletAddress
  const key = await subgraph.key(
    {
      where: {
        owner: loggedInUser.toLowerCase(),
      },
    },
    {
      network,
    }
  )

  if (!key) {
    response.status(404).send({
      message: 'Key not found',
    })
    return
  }

  const ticket = await createTicket({
    lockAddress,
    tokenId,
    network,
    owner: key.owner,
    name: key.lock.name!,
  })

  response.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': ticket.length,
  })

  response.end(ticket)
  return
}

export const getTicket: RequestHandler = async (request, response) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const eventSlug = request.params.eventSlug
  const tokenId = request.params.keyId.toLowerCase().trim()
  const userAddress = request.user?.walletAddress
  const subgraph = new SubgraphService()

  const [key, verifiers] = await Promise.all([
    subgraph.key(
      {
        where: {
          tokenId,
          lock: lockAddress.toLowerCase().trim(),
        },
      },
      {
        network,
      }
    ),
    eventSlug
      ? getEventVerifiers(eventSlug)
      : getVerifiersListForLock(lockAddress, network),
  ])

  if (!key) {
    response.status(404).send({
      message: 'Key not found',
    })
    return
  }

  const baseTicket = {
    keyId: key.tokenId,
    lockAddress: key.lock.address,
    owner: key.owner,
    manager: key.manager,
    publicLockVersion: key.lock.version,
  }

  if (!userAddress) {
    const keyData = await generateKeyMetadata(
      lockAddress,
      tokenId,
      false,
      config.services.locksmith,
      network
    )
    response.status(200).send({
      ...baseTicket,
      name:
        keyData.name?.replace(/ +/, '')?.trim()?.toLowerCase() === 'unlockkey'
          ? key.lock.name
          : keyData.name,
      image: keyData.image,
      description: keyData.description,
      checkedInAt: keyData?.metadata?.checkedInAt,
      attributes: keyData.attributes,
      expiration: key.expiration,
      userMetadata: {
        public: {},
        protected: {},
      },
      isVerifier: false,
    })
    return
  }

  const isManager = key.lock.lockManagers
    .map((item: string) => Normalizer.ethereumAddress(item))
    .includes(Normalizer.ethereumAddress(userAddress))

  const verifier = verifiers.find(
    (item) =>
      Normalizer.ethereumAddress(item.address) ===
      Normalizer.ethereumAddress(userAddress)
  )

  const isVerifier = verifiers
    ?.map((item) => Normalizer.ethereumAddress(item.address))
    .includes(Normalizer.ethereumAddress(userAddress))

  const includeProtected =
    isManager ||
    isVerifier ||
    Normalizer.ethereumAddress(key.owner) ===
      Normalizer.ethereumAddress(userAddress)

  const keyData = await generateKeyMetadata(
    lockAddress,
    tokenId,
    includeProtected,
    config.services.locksmith,
    network
  )

  response.status(200).send({
    ...baseTicket,
    name:
      keyData.name?.replace(/ +/, '')?.trim()?.toLowerCase() === 'unlockkey'
        ? key.lock.name
        : keyData.name,
    image: keyData.image,
    description: keyData.description,
    checkedInAt: keyData?.metadata?.checkedInAt,
    attributes: keyData.attributes,
    expiration: key.expiration,
    userMetadata: {
      public: keyData?.userMetadata?.public || {},
      protected: keyData?.userMetadata?.protected || {},
    },
    isVerifier: isVerifier || isManager,
    verifierName: isVerifier ? verifier?.name : null,
  })
  return
}

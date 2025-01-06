import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { ethers } from 'ethers'
import { RequestHandler } from 'express'
import {
  getCheckedInAttendees,
  getEventBySlug,
  getEventMetadataForLock,
  saveEvent,
  updateEvent,
} from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'
import { CheckoutConfig, EventData } from '../../models'
import { z } from 'zod'
import { getLockSettingsBySlug } from '../../operations/lockSettingOperations'
import { getLockMetadata } from '../../operations/metadataOperations'
import { PaywallConfigType, AttendeeRefund } from '@unlock-protocol/core'
import listManagers from '../../utils/lockManagers'
import { removeProtectedAttributesFromObject } from '../../utils/protectedAttributes'
import { isVerifierOrManagerForLock } from '../../utils/middlewares/isVerifierMiddleware'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getEventUrl } from '../../utils/eventHelpers'
import { getErc20Decimals } from '@unlock-protocol/unlock-js'
import { uploadJsonToS3 } from '../../utils/s3'
import config from '../../config/config'
import { downloadJsonFromS3 } from '../../utils/downloadJsonFromS3'
import logger from '../../logger'
import { getWeb3Service } from '../../initializers'
import { EventStatus } from '@unlock-protocol/types'

// DEPRECATED!
export const getEventDetailsByLock: RequestHandler = async (
  request,
  response
) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const eventDetails = await getEventMetadataForLock(lockAddress, network)
  response.status(200).send(eventDetails)
  return
}

export const EventBody = z.object({
  id: z.number().optional(),
  data: z.any(),
  checkoutConfig: z
    .object({
      config: z.custom<PaywallConfigType>(),
      id: z.string().optional(),
    })
    .optional(),
  status: z.enum([EventStatus.PENDING, EventStatus.DEPLOYED]).optional(),
  transactionHash: z.string().optional(),
})
export type EventBodyType = z.infer<typeof EventBody>

const defaultPaywallConfig: Partial<PaywallConfigType> = {
  title: 'Registration',
  emailRequired: true,
  metadataInputs: [
    {
      name: 'fullname',
      label: 'Full name',
      defaultValue: '',
      type: 'text',
      required: true,
      placeholder: 'Satoshi Nakamoto',
    },
  ],
}

export const saveEventDetails: RequestHandler = async (request, response) => {
  const parsedBody = await EventBody.parseAsync(request.body)
  const [event, created] = await saveEvent(
    parsedBody,
    request.user!.walletAddress
  )

  // Only send email if event is deployed
  if (created && event.status === EventStatus.DEPLOYED) {
    await sendEmail({
      template: 'eventDeployed',
      recipient: event.data.replyTo,
      params: {
        eventName: event!.name,
        eventDate: event!.data.ticket.event_start_date,
        eventTime: event!.data.ticket.event_start_time,
        eventUrl: getEventUrl(event!),
      },
      attachments: [],
    })
  }

  const statusCode = created ? 201 : 200
  response.status(statusCode).send(event.toJSON())
  return
}

export const getAllEvents: RequestHandler = async (request, response) => {
  const page = request.query.page ? Number(request.query.page) : 1
  const events = await EventData.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
    offset: (page - 1) * 10,
    include: [{ model: CheckoutConfig, as: 'checkoutConfig' }],
  })
  events.forEach((event) => {
    event.data = removeProtectedAttributesFromObject(event.data)
  })
  response.status(200).send({
    data: events,
    page,
  })
  return
}

// This function returns the event based on its slug.
// For backward compatibility, if the event does not exist, we look for a lock
// whose slug matches and get the event data from that lock.
export const getEvent: RequestHandler = async (request, response) => {
  const slug = request.params.slug.toLowerCase().trim()
  const event = await getEventBySlug(
    slug,
    true /** includeProtected and we will cleanup later */
  )

  if (event) {
    const eventResponse = event.toJSON() as any // TODO: type!
    if (event.checkoutConfigId) {
      delete eventResponse.checkoutConfigId
      eventResponse.checkoutConfig = await CheckoutConfig.findOne({
        where: {
          id: event.checkoutConfigId,
        },
      })
    }

    // Check if the caller is a verifier or manager and remove protected attributes if not
    let isManagerOrVerifier = false
    if (request.user && eventResponse.checkoutConfig?.config) {
      const locks = Object.keys(eventResponse.checkoutConfig.config.locks)
      for (let i = 0; i < locks.length; i++) {
        if (!isManagerOrVerifier) {
          const lock = locks[i]
          const network =
            eventResponse.checkoutConfig.config.locks[lock].network ||
            eventResponse.checkoutConfig.config.network
          isManagerOrVerifier = await isVerifierOrManagerForLock(
            lock,
            request.user.walletAddress,
            network
          )
        }
      }
    }
    if (!isManagerOrVerifier) {
      eventResponse.data = removeProtectedAttributesFromObject(
        eventResponse.data
      )
    }

    response.status(200).send(eventResponse)
    return
  }

  const settings = await getLockSettingsBySlug(slug)

  if (settings) {
    const lockData = await getLockMetadata({
      lockAddress: settings.lockAddress,
      network: settings.network,
    })

    if (lockData) {
      // We need to look if there are more locks for that event as well!
      // For this we need to check if any checkout config is attached to this lock.
      const checkoutConfig = settings.checkoutConfigId
        ? await CheckoutConfig.findOne({
            where: {
              id: settings.checkoutConfigId,
            },
          })
        : {
            config: {
              ...defaultPaywallConfig,
              locks: {
                [settings.lockAddress]: {
                  network: settings.network,
                },
              },
              referrer: request.user?.walletAddress,
            },
          }

      await saveEvent(
        {
          data: { ...lockData },
          checkoutConfig: checkoutConfig!,
        },
        (
          await listManagers({
            lockAddress: settings.lockAddress,
            network: settings.network,
          })
        )[0]
      )

      response.status(200).send({
        data: { ...lockData },
        checkoutConfig,
      })
      return
    }
  }

  response.status(404).send({
    message: `No event found for slug ${slug}`,
  })
  return
}

// API endpoint that a manager can call to approve refunds for attendees
// This will create a a Merkle proof for the refunds and store it
export const approveRefunds: RequestHandler = async (request, response) => {
  const { amount, network, currency } = await AttendeeRefund.parseAsync(
    request.body
  )

  let decimals = 18

  if (currency) {
    const web3Service = getWeb3Service()
    const provider = web3Service.providerForNetwork(network)

    // Get the decimals
    decimals = await getErc20Decimals(currency, provider)
  }

  const refundAmount = ethers.parseUnits(amount.toString(), decimals)
  const slug = request.params.slug.toLowerCase().trim()

  // Then, get the list of all attendees that attendees!
  const list = await getCheckedInAttendees(slug)

  if (list.length === 0) {
    response.status(404).send({ error: 'No attendees found' })
    return
  }

  // then, create the merkel tree using the OZ library
  const tree = StandardMerkleTree.of(
    list.map((recipient) => [recipient, refundAmount.toString()]),
    ['address', 'uint256']
  )

  // dump the tree
  const fullTree = tree.dump()

  // Then, store the tree (at <slug>.json)
  await uploadJsonToS3(
    config.storage.merkleTreesBucket,
    `${slug}.json`,
    fullTree
  )

  response.status(200).send(fullTree)
  return
}

export const approvedRefunds: RequestHandler = async (request, response) => {
  const slug = request.params.slug.toLowerCase().trim()
  let file
  try {
    file = await downloadJsonFromS3(
      config.storage.merkleTreesBucket,
      `${slug}.json`
    )
  } catch (error) {
    if (error.message !== 'NoSuchKey') {
      logger.error('Error downloading file from S3', error)
    }
  }

  if (!file) {
    response.status(404).send({ error: 'Not found' })
    return
  }

  response.status(200).send(file)
  return
}

export const updateEventData: RequestHandler = async (request, response) => {
  const { slug } = request.params
  const { status, transactionHash, checkoutConfig } = request.body

  try {
    const updatedEvent = await updateEvent(
      slug,
      { status, transactionHash, checkoutConfig },
      request.user!.walletAddress
    )

    if (!updatedEvent) {
      logger.warn('Event not found for update', { slug })
      response.status(404).json({
        error: 'Event not found',
        requestedSlug: slug,
      })
      return
    }

    response.status(200).json({
      slug: updatedEvent.slug,
      status: updatedEvent.status,
      transactionHash: updatedEvent.transactionHash,
    })
  } catch (error) {
    logger.error('Failed to update event', {
      error,
      slug,
      requestBody: { status, transactionHash, checkoutConfig },
    })
    response.status(500).json({
      error: 'Failed to update event',
      details: error.message,
    })
  }
}

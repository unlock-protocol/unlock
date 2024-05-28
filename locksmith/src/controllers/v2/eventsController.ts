import { RequestHandler } from 'express'
import {
  getEventBySlug,
  getEventMetadataForLock,
  saveEvent,
} from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'
import { CheckoutConfig, EventData } from '../../models'
import { z } from 'zod'
import { getLockSettingsBySlug } from '../../operations/lockSettingOperations'
import { getLockMetadata } from '../../operations/metadataOperations'
import { PaywallConfig, PaywallConfigType } from '@unlock-protocol/core'
import listManagers from '../../utils/lockManagers'
import { removeProtectedAttributesFromObject } from '../../utils/protectedAttributes'
import { isVerifierOrManagerForLock } from '../../utils/middlewares/isVerifierMiddleware'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getEventUrl } from '../../utils/eventHelpers'

// DEPRECATED!
export const getEventDetailsByLock: RequestHandler = async (
  request,
  response
) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)
  const eventDetails = await getEventMetadataForLock(lockAddress, network)
  return response.status(200).send(eventDetails)
}

export const EventBody = z.object({
  id: z.number().optional(),
  data: z.any(),
  // @ts-expect-error Type instantiation is excessively deep and possibly infinite
  checkoutConfig: z.object({
    config: PaywallConfig,
    id: z.string().optional(),
  }),
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

  // This was a creation!
  if (created) {
    await sendEmail({
      template: 'eventDeployed',
      recipient: event.data.replyTo,
      // @ts-expect-error object incomplete
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
  return response.status(statusCode).send(event.toJSON())
}

export const getAllEvents: RequestHandler = async (request, response) => {
  const page = request.query.page ? Number(request.query.page) : 1
  const events = await EventData.findAll({
    limit: 10,
    offset: (page - 1) * 10,
    include: [{ model: CheckoutConfig, as: 'checkoutConfig' }],
  })
  events.forEach((event) => {
    event.data = removeProtectedAttributesFromObject(event.data)
  })
  return response.status(200).send({
    data: events,
    page,
  })
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
    if (request.user) {
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

    return response.status(200).send(eventResponse)
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

      return response.status(200).send({
        data: { ...lockData },
        checkoutConfig,
      })
    }
  }

  return response.status(404).send({
    message: `No event found for slug ${slug}`,
  })
}

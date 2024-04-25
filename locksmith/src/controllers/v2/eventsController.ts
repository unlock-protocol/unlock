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
  const includeProtected = false // Should be true if request is coming from an organizer!
  const event = await getEventBySlug(slug, includeProtected)

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

import { RequestHandler } from 'express'
import {
  createEventSlug,
  getEventBySlug,
  getEventDataForLock,
} from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'
import { CheckoutConfig, EventData } from '../../models'
import { z } from 'zod'
import { getLockSettingsBySlug } from '../../operations/lockSettingOperations'
import { getLockMetadata } from '../../operations/metadataOperations'
import { PaywallConfig, PaywallConfigType } from '@unlock-protocol/core'
import { saveCheckoutConfig } from '../../operations/checkoutConfigOperations'

// deprecated!
export const getEventDetails: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  const eventDetails = await getEventDataForLock(lockAddress, network)
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
  const parsed = await EventBody.parseAsync(request.body)

  const slug =
    parsed.data.slug || (await createEventSlug(parsed.data.name, parsed.id))

  const [event, created] = await EventData.upsert(
    {
      id: parsed.id,
      name: parsed.data.name,
      slug,
      data: {
        ...parsed.data,
        slug, // Making sure we add the slug to the data as well.
      },
      createdBy: request.user!.walletAddress,
    },
    {
      conflictFields: ['slug'],
    }
  )

  if (!event.checkoutConfigId) {
    const checkoutConfig = await PaywallConfig.strip().parseAsync(
      parsed.checkoutConfig.config
    )
    const createdConfig = await saveCheckoutConfig({
      name: `Checkout config for ${event.name}`,
      config: checkoutConfig,
      createdBy: request.user!.walletAddress,
    })
    // And now attach the id to the event
    event.checkoutConfigId = createdConfig.id
    await event.save()
  }

  // TODO: We should update the metadata on the locks
  // to point to this event by default!

  const statusCode = created ? 201 : 200
  return response.status(statusCode).send(event.toJSON())
}

// This function returns the event based on its slug.
// For backward compatibility, if the event does not exist, we look for a lock
// whose slug matches and get the event data from that lock.
export const getEvent: RequestHandler = async (request, response) => {
  const slug = request.params.slug.toLowerCase().trim()
  const event = await getEventBySlug(slug)

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

  if (!event) {
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
        return response.status(200).send({
          data: { ...lockData },
          checkoutConfig,
        })
      }
    }
  }

  return response.status(404).send({
    message: `No event found for slug ${slug}`,
  })
}

import { RequestHandler } from 'express'
import {
  createEventSlug,
  getEventDataForLock,
} from '../../operations/eventOperations'
import normalizer from '../../utils/normalizer'
import { CheckoutConfig, EventData } from '../../models'
import { z } from 'zod'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { getLockSettingsBySlug } from '../../operations/lockSettingOperations'
import { getLockMetadata } from '../../operations/metadataOperations'

export const getEventDetails: RequestHandler = async (request, response) => {
  const network = Number(request.params.network)
  const lockAddress = normalizer.ethereumAddress(request.params.lockAddress)

  const eventDetails = await getEventDataForLock(lockAddress, network)
  return response.status(200).send(eventDetails)
}

const EventBody = z.object({
  id: z.number().optional(),
  name: z.string(),
  data: z.any(),
  locks: z.array(z.string()),
})

export const saveEventDetails: RequestHandler = async (request, response) => {
  const parsed = await EventBody.parseAsync(request.body)
  const web3Service = new Web3Service(networks)
  const userAddress = request.user!.walletAddress
  const lockManagers = await Promise.all(
    parsed.locks.map((item) => {
      const [lockAddress, networkId] = item.split('-')
      return web3Service.isLockManager(
        lockAddress,
        userAddress,
        Number(networkId)
      )
    })
  )
  const isLockManager = lockManagers.some((item) => item)

  if (!isLockManager) {
    return response.status(403).send({
      message: `${userAddress} is not a lock manager of this transaction`,
    })
  }

  // TODO: We should update the metadata on the locks to point to this event
  // by default!
  const slug = await createEventSlug(parsed.name, parsed.id)
  const [event, created] = await EventData.upsert(
    {
      id: parsed.id,
      name: parsed.name,
      slug,
      data: parsed.data,
      locks: parsed.locks,
      createdBy: request.user!.walletAddress,
    },
    {
      conflictFields: ['id'],
    }
  )
  const statusCode = created ? 201 : 200
  return response.status(statusCode).send(event.toJSON())
}

// This function returns the event based on its slug.
// For backward compatibility, if the event does not exist, we look for a lock
// whose slug matches and get the event data from that lock.
export const getEventBySlug: RequestHandler = async (request, response) => {
  const slug = request.params.slug.toLowerCase().trim()
  const event = await EventData.findOne({
    where: { slug },
  })

  if (event) {
    const eventResponse = event.toJSON() as any // TODO: type!
    const checkoutConfig = {
      locks: eventResponse.locks.reduce((acc: any, lockAsString: any) => {
        const [address, network] = lockAsString.split('-')
        return {
          ...acc,
          [address]: {
            network: parseInt(network),
          },
        }
      }, {}),
    }
    delete eventResponse.locks
    eventResponse.checkoutConfig = checkoutConfig
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
              locks: {
                [settings.lockAddress]: {
                  network: settings.network,
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

import { Task } from 'graphile-worker'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { EventStatus } from '@unlock-protocol/types'
import { z } from 'zod'
import logger from '../../../logger'
import { updateEvent } from '../../../operations/eventOperations'
import { PaywallConfigType } from '@unlock-protocol/core'

const defaultEventCheckoutConfigForLockOnNetwork = (
  lockAddress: string,
  network: number
) => {
  console.log('Generating default event checkout config', {
    lockAddress,
    network,
  })
  return {
    title: 'Registration',
    locks: {
      [lockAddress]: {
        network: network,
        metadataInputs: [
          {
            name: 'email',
            type: 'email',
            label: 'Email address (will receive the ticket)',
            required: true,
            placeholder: 'your@email.com',
            defaultValue: '',
          },
          {
            name: 'fullname',
            type: 'text',
            label: 'Full name',
            required: true,
            placeholder: 'Satoshi Nakamoto',
            defaultValue: '',
          },
        ],
      },
    },
  } as PaywallConfigType
}

const EventDeploymentPayload = z.object({
  slug: z.string(),
  transactionHash: z.string(),
  network: z.number(),
  walletAddress: z.string(),
})

export const completeEventDeployment: Task = async (payload) => {
  const { slug, transactionHash, network, walletAddress } = payload as z.infer<
    typeof EventDeploymentPayload
  >

  try {
    const subgraph = new SubgraphService()

    // First query receipts to get the lock address
    const receipts = await subgraph.receipts(
      {
        where: {
          id: transactionHash.toLowerCase(),
        },
      },
      {
        networks: [network],
      }
    )

    if (receipts.length > 0) {
      const lockAddress = receipts[0].lockAddress

      // Then query the lock using the lockAddress from the receipt
      const locks = await subgraph.locks(
        {
          where: {
            address: lockAddress,
          },
        },
        {
          networks: [network],
        }
      )

      if (locks.length > 0) {
        const lock = locks[0]

        // Update event with lock address and checkout config
        const updatedEvent = await updateEvent(
          slug,
          {
            status: EventStatus.DEPLOYED,
            checkoutConfig: {
              config: defaultEventCheckoutConfigForLockOnNetwork(
                lock.address,
                network
              ),
            },
          },
          walletAddress
        )

        if (!updatedEvent) {
          throw new Error('Event not found')
        }
      } else {
        throw new Error('No lock found for address')
      }
    } else {
      throw new Error('No receipt found for transaction')
    }
  } catch (error) {
    logger.error(`Failed to complete event deployment for ${slug}`, error)
    throw error
  }
}

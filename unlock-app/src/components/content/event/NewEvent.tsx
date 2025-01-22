'use client'

import { useState } from 'react'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { locksmith } from '~/config/locksmith'
import { networks } from '@unlock-protocol/networks'
import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { useProvider } from '~/hooks/useProvider'
import { EventStatus } from '@unlock-protocol/types'
import { PaywallConfigType } from '@unlock-protocol/core'

export interface TransactionDetails {
  hash: string
  network: number
  slug?: string
}

export const defaultEventCheckoutConfigForLockOnNetwork = (
  lockAddress: string,
  network: number
) => {
  return {
    title: 'Registration',
    locks: {
      [lockAddress]: {
        network,
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

export const NewEvent = () => {
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { getWalletService } = useProvider()

  const onSubmit = async (formData: NewEventForm) => {
    try {
      const walletService = await getWalletService(formData.network)

      // Create initial event with pending status
      const pendingEventData = {
        data: {
          ...formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
          }),
          ...formData.metadata,
        },
        status: EventStatus.PENDING,
      }

      // Create pending event first
      const { data: pendingEvent } =
        await locksmith.saveEventData(pendingEventData)

      // Deploy the lock and wait for the address
      const lockAddress = await walletService.createLock(
        {
          ...formData.lock,
          name: formData.lock.name,
          publicLockVersion:
            networks[formData.network].publicLockVersionToDeploy,
        },
        {},
        async (createLockError, transactionHash) => {
          if (createLockError) {
            throw createLockError
          }
          if (transactionHash) {
            setTransactionDetails({
              hash: transactionHash,
              network: formData.network,
              slug: pendingEvent.slug,
            })
          }
        }
      )

      // If lock is created, update metadata and update event status to deployed
      if (lockAddress) {
        // Update lock metadata
        await locksmith.updateLockMetadata(formData.network, lockAddress, {
          metadata: {
            name: `Ticket for ${formData.lock.name}`,
            image: formData.metadata.image,
          },
        })

        // Update existing event with checkout config and deployed status
        await locksmith.updateEventData(pendingEvent.slug, {
          status: EventStatus.DEPLOYED,
          checkoutConfig: {
            name: `Checkout config for ${formData.lock.name}`,
            config: defaultEventCheckoutConfigForLockOnNetwork(
              lockAddress,
              formData.network
            ),
          },
        })
      }
    } catch (error) {
      ToastHelper.error(
        'There was an error creating your event. Please try again.'
      )
    }
  }

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
      {transactionDetails && (
        <LockDeploying transactionDetails={transactionDetails} />
      )}
      {!transactionDetails && <Form onSubmit={onSubmit} />}
    </div>
  )
}

export default NewEvent

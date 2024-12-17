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

export const NewEvent = () => {
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { getWalletService } = useProvider()

  const onSubmit = async (formData: NewEventForm) => {
    try {
      // Create the event with pending status
      const { data: event } = await locksmith.saveEventData({
        data: {
          ...formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
          }),
          ...formData.metadata,
          status: EventStatus.PENDING,
        },
      })

      // Deploy the lock
      const walletService = await getWalletService(formData.network)
      walletService.createLock(
        {
          ...formData.lock,
          name: formData.lock.name,
          publicLockVersion:
            networks[formData.network].publicLockVersionToDeploy,
        },
        {},
        async (createLockError, transactionHash) => {
          if (createLockError) {
            console.error('Error creating lock:', createLockError)
            throw createLockError
          }
          if (transactionHash) {
            // update the event with the transaction hash
            await locksmith.updateEventData(event.slug, {
              transactionHash,
            })
            setTransactionDetails({
              hash: transactionHash,
              network: formData.network,
              slug: event.slug,
            })
          }
        }
      )
    } catch (error) {
      console.error('Error in event creation process:', error)
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

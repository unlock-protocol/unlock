'use client'

import { useState } from 'react'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { locksmith } from '~/config/locksmith'
import { networks } from '@unlock-protocol/networks'

import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useProvider } from '~/hooks/useProvider'
import { EventStatus } from '@unlock-protocol/types'

export interface TransactionDetails {
  hash: string
  network: number
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
  const [slug, setSlug] = useState<string | undefined>(undefined)
  const [lockAddress, setLockAddress] = useState<string>()
  const { getWalletService } = useProvider()

  const onSubmit = async (formData: NewEventForm) => {
    const walletService = await getWalletService(formData.network)
    try {
      // Create the event first with pending status
      const { data: event } = await locksmith.saveEventData({
        data: {
          ...formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
          }),
          ...formData.metadata,
        },
        status: EventStatus.PENDING,
      })

      // Set slug for URL if present
      if (event.slug) {
        setSlug(event.slug)
      }

      // Deploy the lock
      await walletService.createLock(
        {
          ...formData.lock,
          name: formData.lock.name,
          publicLockVersion:
            networks[formData.network].publicLockVersionToDeploy,
        },
        {} /** transactionParams */,
        async (createLockError, transactionHash) => {
          if (createLockError) {
            throw createLockError
          }
          if (transactionHash && event.slug) {
            // Update event with transaction hash
            await locksmith.updateEventData(event.slug, {
              transactionHash,
            })

            setTransactionDetails({
              hash: transactionHash,
              network: formData.network,
            })
          }
        }
      )

      // Once we have the lock address, update the event with checkout config
      if (lockAddress && event.slug) {
        await locksmith.updateEventData(event.slug, {
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
      console.error(error)
      ToastHelper.error('The contract could not be deployed. Please try again.')
    }
  }

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
      {transactionDetails && (
        <LockDeploying
          transactionDetails={transactionDetails}
          lockAddress={lockAddress}
          slug={slug}
        />
      )}
      {!transactionDetails && <Form onSubmit={onSubmit} />}
    </div>
  )
}

export default NewEvent

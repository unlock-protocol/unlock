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
    let lockAddress
    const walletService = await getWalletService(formData.network)
    try {
      lockAddress = await walletService.createLock(
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
          if (transactionHash) {
            setTransactionDetails({
              hash: transactionHash,
              network: formData.network,
            })
          }
        }
      ) // Deploy the lock! and show the "waiting" screen + mention to *not* close!
    } catch (error) {
      console.error(error)
      ToastHelper.error('The contract could not be deployed. Please try again.')
    }
    if (lockAddress) {
      await locksmith.updateLockMetadata(formData.network, lockAddress, {
        metadata: {
          name: `Ticket for ${formData.lock.name}`,
          image: formData.metadata.image,
        },
      })
      const { data: event } = await locksmith.saveEventData({
        data: {
          ...formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
          }),
          ...formData.metadata,
        },
        checkoutConfig: {
          name: `Checkout config for ${formData.lock.name}`,
          config: defaultEventCheckoutConfigForLockOnNetwork(
            lockAddress,
            formData.network
          ),
        },
      })
      // Save slug for URL if present
      setSlug(event.slug)

      // Finally
      setLockAddress(lockAddress)
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

'use client'

import { useEffect, useState } from 'react'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '@unlock-protocol/ui'
import { LockDeploying } from './LockDeploying'
import { locksmith } from '~/config/locksmith'
import { networks } from '@unlock-protocol/networks'
import {
  formDataToMetadata,
  toFormData,
} from '~/components/interface/locks/metadata/utils'
import { useProvider } from '~/hooks/useProvider'
import { EventStatus } from '@unlock-protocol/types'
import { PaywallConfigType } from '@unlock-protocol/core'
import { EventsLayout } from './Layout/constants'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import LoadingIcon from '~/components/interface/Loading'
import { UNLIMITED_KEYS_DURATION } from '~/constants'

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
          {
            name: 'newsletter-optin',
            type: 'checkbox',
            label: 'I agree to receive emails from partners',
            public: false,
            required: false,
            placeholder: '',
          },
        ],
      },
    },
  } as PaywallConfigType
}

const parseBooleanValue = (value: unknown, fallback: boolean) => {
  if (value === undefined || value === null) {
    return fallback
  }
  if (typeof value === 'string') {
    return value !== 'false'
  }
  return Boolean(value)
}

export const NewEvent = () => {
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { getWalletService } = useProvider()
  const web3Service = useWeb3Service()
  const searchParams = useSearchParams()
  const cloneSlug = searchParams.get('clone')

  const {
    data: clonedEventValues,
    isLoading: isLoadingClone,
    isError: hasCloneError,
  } = useQuery({
    queryKey: ['clonedEventValues', cloneSlug],
    enabled: !!cloneSlug,
    retry: false,
    queryFn: async (): Promise<NewEventForm> => {
      const { data: clonedEvent } = await locksmith.getEvent(cloneSlug!)
      const event = toFormData({
        ...clonedEvent.data,
        slug: clonedEvent.slug,
      })
      const checkoutConfig = clonedEvent.checkoutConfig?.config
      const [lockAddress, lockConfig] =
        Object.entries(checkoutConfig?.locks || {})[0] || []

      if (!lockAddress || !lockConfig) {
        throw new Error('Event does not have a lock to clone.')
      }

      const network = Number(
        (lockConfig as { network?: number }).network ?? checkoutConfig?.network
      )
      if (!Number.isFinite(network) || !networks[network]) {
        throw new Error('Event lock does not have a supported network.')
      }

      const lock = await web3Service.getLock(lockAddress, network)
      const { name, slug, ...metadata } = event

      return {
        network,
        lock: {
          name: `Copy of ${name || lock?.name || 'Event'}`,
          expirationDuration:
            lock?.expirationDuration || UNLIMITED_KEYS_DURATION,
          maxNumberOfKeys: lock?.maxNumberOfKeys,
          currencyContractAddress: lock?.currencyContractAddress || null,
          keyPrice: lock?.keyPrice?.toString() || '0',
        },
        currencySymbol:
          lock?.currencySymbol || networks[network].nativeCurrency.symbol,
        metadata: {
          ...metadata,
          description: event.description || '',
          image: event.image || '',
          requiresApproval: parseBooleanValue(event.requiresApproval, false),
          emailSender: event.emailSender || '',
          replyTo: event.replyTo || '',
          ticket: {
            event_is_in_person: parseBooleanValue(
              event.ticket?.event_is_in_person,
              true
            ),
            event_start_date: event.ticket?.event_start_date || '',
            event_start_time: event.ticket?.event_start_time || '',
            event_end_date: event.ticket?.event_end_date || '',
            event_end_time: event.ticket?.event_end_time || '',
            event_timezone:
              event.ticket?.event_timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            event_address: event.ticket?.event_address || '',
            event_location: event.ticket?.event_location || '',
          },
        },
      }
    },
  })

  useEffect(() => {
    if (cloneSlug && hasCloneError) {
      ToastHelper.error(
        'Unable to clone this event. You can still create one from scratch.'
      )
    }
  }, [cloneSlug, hasCloneError])

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
          layout: EventsLayout.Bannerless,
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
      {isLoadingClone && <LoadingIcon />}
      {transactionDetails && (
        <LockDeploying transactionDetails={transactionDetails} />
      )}
      {!transactionDetails && !isLoadingClone && (
        <Form
          key={cloneSlug || 'new-event'}
          onSubmit={onSubmit}
          defaultValues={clonedEventValues}
        />
      )}
    </div>
  )
}

export default NewEvent

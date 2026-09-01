'use client'

import { useState } from 'react'
import { Form, NewEventForm, NewEventFormDefaults } from './Form'
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
import { Event, PaywallConfigType } from '@unlock-protocol/core'
import { EventsLayout } from './Layout/constants'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import LoadingIcon from '~/components/interface/Loading'
import { useAuthenticate } from '~/hooks/useAuthenticate'

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

const checkoutConfigForClonedLock = (
  checkoutConfig: PaywallConfigType,
  lockAddress: string,
  network: number
) => {
  const defaultConfig = defaultEventCheckoutConfigForLockOnNetwork(
    lockAddress,
    network
  )
  const sourceLockConfig = Object.values(checkoutConfig.locks || {})[0] || {}
  const metadataInputs =
    sourceLockConfig.metadataInputs || checkoutConfig.metadataInputs

  return {
    ...defaultConfig,
    title: checkoutConfig.title || defaultConfig.title,
    emailRequired: checkoutConfig.emailRequired,
    network,
    locks: {
      [lockAddress]: {
        ...defaultConfig.locks[lockAddress],
        ...(metadataInputs ? { metadataInputs } : {}),
        ...(typeof sourceLockConfig.emailRequired === 'boolean'
          ? { emailRequired: sourceLockConfig.emailRequired }
          : {}),
        network,
      },
    },
  } as PaywallConfigType
}

const getBooleanValue = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}

const eventToFormDefaults = ({
  event,
  lock,
  network,
}: {
  event: Event
  lock?: Partial<NewEventForm['lock']> & {
    currencySymbol?: string | null
  }
  network?: number
}): NewEventFormDefaults => {
  const sourceTicket = event.ticket || {}
  const lockDefaults: NewEventFormDefaults['lock'] = {
    name: event.name,
  }

  if (lock) {
    lockDefaults.expirationDuration = lock.expirationDuration
    lockDefaults.maxNumberOfKeys = lock.maxNumberOfKeys
    lockDefaults.currencyContractAddress = lock.currencyContractAddress ?? null
    lockDefaults.keyPrice = lock.keyPrice ? `${lock.keyPrice}` : '0'
  }

  const defaultValues: NewEventFormDefaults = {
    lock: lockDefaults,
    currencySymbol:
      lock?.currencySymbol ||
      (network ? networks[network].nativeCurrency.symbol : undefined),
    metadata: {
      description: event.description,
      image: event.image,
      ticket: {
        event_cover_image: sourceTicket.event_cover_image,
        event_start_date: sourceTicket.event_start_date,
        event_start_time: sourceTicket.event_start_time,
        event_end_date: sourceTicket.event_end_date,
        event_end_time: sourceTicket.event_end_time,
        event_timezone: sourceTicket.event_timezone,
        event_address: sourceTicket.event_address,
        event_location: sourceTicket.event_location,
        event_url: sourceTicket.event_url,
        event_is_in_person: getBooleanValue(
          sourceTicket.event_is_in_person,
          true
        ),
      },
      requiresApproval: getBooleanValue(event.requiresApproval, false),
      attendeeRefund: event.attendeeRefund,
      emailSender: event.emailSender,
      replyTo: event.replyTo,
      layout: event.layout,
    },
  }

  if (network) {
    defaultValues.network = network
  }

  if (!defaultValues.currencySymbol) {
    delete defaultValues.currencySymbol
  }

  return defaultValues
}

export const NewEvent = () => {
  const searchParams = useSearchParams()
  const cloneSlug = searchParams.get('clone')
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { getWalletService } = useProvider()
  const web3Service = useWeb3Service()
  const { account } = useAuthenticate()

  const {
    data: clonedEvent,
    isLoading: isClonedEventLoading,
    isError: isClonedEventError,
    error: clonedEventError,
  } = useQuery({
    queryKey: ['clonedEvent', cloneSlug, account],
    enabled: !!cloneSlug && !!account,
    queryFn: async () => {
      const { data: eventMetadata } = await locksmith.getEvent(cloneSlug!)
      const event = toFormData({
        ...eventMetadata.data!,
        slug: eventMetadata.slug,
      }) as Event
      const checkoutConfig = eventMetadata.checkoutConfig as
        | { id?: string; config: PaywallConfigType }
        | undefined
      const sourceLocks = checkoutConfig?.config?.locks || {}
      const sourceLockAddresses = Object.keys(sourceLocks)
      const sourceLockAddress = sourceLockAddresses[0]
      const sourceNetwork = sourceLockAddress
        ? sourceLocks[sourceLockAddress]?.network ||
          checkoutConfig?.config?.network
        : checkoutConfig?.config?.network

      const isOrganizer = await Promise.all(
        sourceLockAddresses.map((lockAddress) => {
          const network =
            sourceLocks[lockAddress].network || checkoutConfig?.config.network

          if (!network) {
            return false
          }

          return web3Service.isLockManager(lockAddress, account!, network)
        })
      )

      if (!isOrganizer.some(Boolean)) {
        throw new Error('Only event organizers can clone this event.')
      }

      const lock =
        sourceLockAddress && sourceNetwork
          ? await web3Service.getLock(sourceLockAddress, sourceNetwork)
          : undefined

      return {
        checkoutConfig,
        defaultValues: eventToFormDefaults({
          event,
          lock,
          network: sourceNetwork,
        }),
      }
    },
  })

  const isCloneLoading = !!cloneSlug && (!account || isClonedEventLoading)

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
          layout: formData.metadata.layout || EventsLayout.Bannerless,
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
        const checkoutConfig = clonedEvent?.checkoutConfig?.config
          ? checkoutConfigForClonedLock(
              clonedEvent.checkoutConfig.config,
              lockAddress,
              formData.network
            )
          : defaultEventCheckoutConfigForLockOnNetwork(
              lockAddress,
              formData.network
            )

        await locksmith.updateEventData(pendingEvent.slug, {
          status: EventStatus.DEPLOYED,
          checkoutConfig: {
            name: `Checkout config for ${formData.lock.name}`,
            config: checkoutConfig,
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
      {!transactionDetails && isCloneLoading && <LoadingIcon />}
      {!transactionDetails && !isCloneLoading && isClonedEventError && (
        <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
          {clonedEventError instanceof Error
            ? clonedEventError.message
            : 'We could not load the event you want to clone. Please try again from the event page.'}
        </div>
      )}
      {!transactionDetails && !isCloneLoading && !isClonedEventError && (
        <Form onSubmit={onSubmit} defaultValues={clonedEvent?.defaultValues} />
      )}
    </div>
  )
}

export default NewEvent

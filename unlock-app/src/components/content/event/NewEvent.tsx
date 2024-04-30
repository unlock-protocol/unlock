import { useState } from 'react'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Form, NewEventForm } from './Form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { LockDeploying } from './LockDeploying'
import { storage } from '~/config/storage'
import { networks } from '@unlock-protocol/networks'

import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { useAuth } from '~/contexts/AuthenticationContext'
import { PaywallConfigType } from '@unlock-protocol/core'
import useEventGatedRoom from '~/hooks/useEventGatedRoom'

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
  const { getWalletService } = useAuth()

  // event gated room custom hook
  const eventGatedRoomHook = useEventGatedRoom()

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
      ToastHelper.error(`The contract could not be deployed. Please try again.`)
    }
    if (lockAddress) {
      await storage.updateLockMetadata(formData.network, lockAddress, {
        metadata: {
          name: `Ticket for ${formData.lock.name}`,
          image: formData.metadata.image,
        },
      })

      // Initialize a variable to store the created token-gated room
      let generatedEventRoomUrl = ''

      // Check if the event has the huddle meeting option enabled and if the lock address is available
      if (eventGatedRoomHook.isHuddleMeeting && lockAddress) {
        // Create the event's room
        try {
          const response = await storage.createEventTokenGatedRoom({
            title: `${formData.lock.name} | Event Room`,
            chain: eventGatedRoomHook.selectedHuddleNetwork,
            contractAddress: lockAddress,
          })
          const data = await response.data
          // directly assign the generated URL to the generated event address variable
          generatedEventRoomUrl = data.eventRoomUrl!
        } catch (error) {
          console.error("Failed to create the event's room", error)
          ToastHelper.error("Failed to create the event's room.")
        }
      }

      const { data: event } = await storage.saveEventData({
        data: {
          ...formDataToMetadata({
            name: formData.lock.name,
            ...formData.metadata,
            ticket: {
              ...formData.metadata.ticket,
              event_address: eventGatedRoomHook.isHuddleMeeting
                ? generatedEventRoomUrl
                : formData.metadata.ticket?.event_address,
            },
          }),
          ...formData.metadata,
          ticket: {
            ...formData.metadata.ticket,
            event_address: eventGatedRoomHook.isHuddleMeeting
              ? generatedEventRoomUrl
              : formData.metadata.ticket?.event_address,
          },
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
    <AppLayout
      showLinks={false}
      authRequired={true}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        {transactionDetails && (
          <LockDeploying
            transactionDetails={transactionDetails}
            lockAddress={lockAddress}
            slug={slug}
          />
        )}
        {!transactionDetails && (
          <Form
            onSubmit={onSubmit}
            // share event gated room hook
            eventGatedRoomHook={eventGatedRoomHook}
          />
        )}
      </div>
    </AppLayout>
  )
}

export default NewEvent

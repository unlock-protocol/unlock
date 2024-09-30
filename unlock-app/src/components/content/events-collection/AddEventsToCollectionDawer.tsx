'use client'

import {
  Button,
  Disclosure,
  Drawer,
  Input,
  Placeholder,
  Select,
} from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useUserEvents } from '~/hooks/useUserEvents'
import { Form as EventCreationForm, NewEventForm } from '../event/Form'
import { useEvent } from '~/hooks/useEvent'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAddToEventCollection } from '~/hooks/useEventCollection'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  defaultEventCheckoutConfigForLockOnNetwork,
  TransactionDetails,
} from '../event/NewEvent'
import { locksmith } from '~/config/locksmith'
import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { networks } from '@unlock-protocol/networks'
import { LockDeploying } from '../event/LockDeploying'

type AddMethod = 'url' | 'existing' | 'form' | null

interface AddEventsToCollectionDrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isManager: boolean
  collectionSlug: string | undefined
  existingEventSlugs: string[]
}

export default function AddEventsToCollectionDrawer({
  isOpen,
  setIsOpen,
  isManager,
  collectionSlug,
  existingEventSlugs,
}: AddEventsToCollectionDrawerProps) {
  const { account, getWalletService } = useAuth()
  const [newEventSlug, setNewEventSlug] = useState<string | undefined>(
    undefined
  )
  const [lockAddress, setLockAddress] = useState<string>()
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { addToEventCollection, isAddingToEventCollection } =
    useAddToEventCollection(collectionSlug!)
  const { data: userEvents, isPending: isLoadingUserEvents } = useUserEvents(
    account!
  )

  const [eventUrl, setEventUrl] = useState<string>('')
  const [eventSlug, setEventSlug] = useState<string>('')
  const { data: event, isLoading: isLoadingEvent } = useEvent({
    slug: eventSlug,
  })
  const [addMethod, setAddMethod] = useState<AddMethod>(null)
  const [isUrlValid, setIsUrlValid] = useState(false)
  const [isEventSelected, setIsEventSelected] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [hasCheckedUrl, setHasCheckedUrl] = useState<boolean>(false)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (eventSlug.trim() !== '' && event) {
      // Check for duplication
      if (existingEventSlugs.includes(eventSlug)) {
        setIsDuplicate(true)
        setIsUrlValid(false)
      } else {
        setIsDuplicate(false)
        setIsEventSelected(true)
        setIsUrlValid(true)
      }
    } else {
      setIsEventSelected(false)
      setIsUrlValid(false)
      setIsDuplicate(false)
    }
  }, [eventSlug, event, existingEventSlugs])

  const handleSubmit = async () => {
    if (!eventSlug.trim()) {
      ToastHelper.error('No event selected')
      return
    }
    try {
      setIsSubmitting(true)
      await addToEventCollection({
        collectionSlug: collectionSlug!,
        eventSlug,
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding event to collection:', error)
      ToastHelper.error('Failed to add event to the collection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkEventUrlValidity = () => {
    // Indicate that the url's validity has been checked
    setHasCheckedUrl(true)
    const slugMatch = eventUrl.match(
      /https:\/\/(?:app|staging-app)\.unlock-protocol\.com\/event\/([^/?#]+)/
    )
    if (slugMatch && slugMatch[1]) {
      setEventSlug(slugMatch[1])
    } else {
      setIsUrlValid(false)
      setIsDuplicate(false)
      setEventSlug('')
    }
  }

  // Filter the user's events to exclude existing event slugs
  const filteredUserEvents = userEvents?.filter(
    (userEvent) => !existingEventSlugs.includes(userEvent.slug!)
  )

  const userEventsOptions =
    filteredUserEvents?.map((eventOption) => {
      return {
        label: eventOption?.name
          ? eventOption.name.replace(/^ticket for\s+/i, '')
          : '',
        value: eventOption?.slug || '',
      }
    }) || []

  const isUrlButtonDisabled = eventUrl.trim() === ''

  // override setIsOpen to prevent closing during submission
  const handleSetIsOpen = (open: boolean) => {
    if (!isSubmitting) {
      setIsOpen(open)
    }
  }

  const renderInitialOptions = () => (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setAddMethod('url')} className="w-full">
        Add via URL
      </Button>
      <div className="space-y-1">
        {filteredUserEvents && filteredUserEvents?.length > 0 && (
          <Button
            onClick={() => setAddMethod('existing')}
            className="w-full"
            disabled={
              userEvents?.length === 0 || filteredUserEvents?.length === 0
            }
          >
            Select events I organized
          </Button>
        )}
        {userEvents?.length === 0 && !filteredUserEvents && (
          <p className="text-sm text-center text-gray-500">
            You haven&apos;t created any events yet.{' '}
            <span className="cursor-pointer text-brand-ui-primary">
              <Link href="/event/new" target="_blank">
                Create one
              </Link>
            </span>
            .
          </p>
        )}
      </div>
      {isManager && (
        <Button onClick={() => setAddMethod('form')} className="w-full">
          Create a new event
        </Button>
      )}
    </div>
  )

  const renderAddViaUrl = () => (
    <div className="flex flex-col gap-8">
      <Button
        variant="outlined-primary"
        size="small"
        onClick={() => {
          setAddMethod(null)
          setEventUrl('')
          setIsUrlValid(false)
          setEventSlug('')
          setIsDuplicate(false)
          setHasCheckedUrl(false)
        }}
        className="self-start"
        disabled={isSubmitting}
      >
        Back
      </Button>
      <Disclosure label="Add via URL" defaultOpen>
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            autoComplete="on"
            placeholder="https://app.unlock-protocol.com/event/your-event-slug"
            label="Event URL"
            description="Enter the URL of your Unlock event."
            value={eventUrl}
            onChange={(e) => {
              setEventUrl(e.target.value)
              setIsUrlValid(false)
              setIsDuplicate(false)
              setEventSlug('')
              setHasCheckedUrl(false)
            }}
            disabled={isSubmitting}
          />
          <Button
            onClick={checkEventUrlValidity}
            disabled={isUrlButtonDisabled || isLoadingEvent || isSubmitting}
          >
            {isLoadingEvent ? 'Checking...' : 'Check Validity'}
          </Button>
          {eventUrl && hasCheckedUrl && (
            <p
              className={`text-sm ${
                isUrlValid
                  ? 'text-green-500'
                  : isDuplicate
                    ? 'text-red-500'
                    : 'text-red-500'
              }`}
            >
              {isUrlValid
                ? 'Valid URL'
                : isDuplicate
                  ? 'This event already exists in the collection.'
                  : 'Invalid URL. Please use a URL from https://staging-app.unlock-protocol.com/event/ or https://app.unlock-protocol.com/event/'}
            </p>
          )}
        </div>
      </Disclosure>

      {/* Add Event Button */}
      {isUrlValid && !isDuplicate && (
        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isUrlValid || isAddingToEventCollection || isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : isManager
                ? 'Add Event'
                : 'Submit Event'}
          </Button>
        </div>
      )}
    </div>
  )

  const renderSelectExisting = () => (
    <div className="flex flex-col gap-8">
      <Button
        variant="outlined-primary"
        size="small"
        onClick={() => {
          setAddMethod(null)
          setEventSlug('')
          setIsEventSelected(false)
        }}
        className="self-start"
        disabled={isSubmitting}
      >
        Back
      </Button>
      <Disclosure label="Select from your events" defaultOpen>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 w-full">
            {isLoadingUserEvents ? (
              <Placeholder.Root>
                <Placeholder.Card />
              </Placeholder.Root>
            ) : filteredUserEvents && filteredUserEvents.length > 0 ? (
              <Select
                onChange={(newValue) => {
                  setEventSlug(newValue?.toString() || '')
                  setIsEventSelected(newValue !== undefined && newValue !== '')
                }}
                options={userEventsOptions}
                label="Your Existing Events"
                defaultValue={
                  userEventsOptions.length > 0 ? userEventsOptions[0].value : ''
                }
                description="Select an event from your existing events."
                disabled={isSubmitting}
              />
            ) : (
              <p className="text-sm text-gray-500">
                No available events to add.
              </p>
            )}
          </div>
        </div>
      </Disclosure>
      {/* Add Event Button */}
      {isEventSelected && (
        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={
              !isEventSelected || isAddingToEventCollection || isSubmitting
            }
          >
            {isSubmitting
              ? 'Submitting...'
              : isManager
                ? 'Add Event'
                : 'Submit Event'}
          </Button>
        </div>
      )}
    </div>
  )

  const renderCreateForm = () => (
    <div className="flex flex-col gap-8">
      <Button
        variant="outlined-primary"
        size="small"
        onClick={() => setAddMethod(null)}
        className="self-start"
        disabled={isSubmitting}
      >
        Back
      </Button>

      <div className="flex flex-col gap-4">
        {transactionDetails && (
          <LockDeploying
            compact={true}
            transactionDetails={transactionDetails}
            lockAddress={lockAddress}
            slug={newEventSlug}
          />
        )}
        {!transactionDetails && (
          <EventCreationForm
            compact={true}
            onSubmit={handleEventCreationAndAddition}
          />
        )}
      </div>
    </div>
  )

  const handleEventCreationAndAddition = async (eventData: NewEventForm) => {
    setIsSubmitting(true)
    let lockAddress
    const walletService = await getWalletService(eventData.network)
    try {
      lockAddress = await walletService.createLock(
        {
          ...eventData.lock,
          name: eventData.lock.name,
          publicLockVersion:
            networks[eventData.network].publicLockVersionToDeploy,
        },
        {},
        async (createLockError, transactionHash) => {
          if (createLockError) {
            throw createLockError
          }
          if (transactionHash) {
            setTransactionDetails({
              hash: transactionHash,
              network: eventData.network,
            })
          }
        }
      )
    } catch (error) {
      console.error(error)
      ToastHelper.error('The contract could not be deployed. Please try again.')
      setIsSubmitting(false)
      return
    }
    if (lockAddress) {
      try {
        await locksmith.updateLockMetadata(eventData.network, lockAddress, {
          metadata: {
            name: `Ticket for ${eventData.lock.name}`,
            image: eventData.metadata.image,
          },
        })
        const { data: newEvent } = await locksmith.saveEventData({
          data: {
            ...formDataToMetadata({
              name: eventData.lock.name,
              ...eventData.metadata,
            }),
            ...eventData.metadata,
          },
          checkoutConfig: {
            name: `Checkout config for ${eventData.lock.name}`,
            config: defaultEventCheckoutConfigForLockOnNetwork(
              lockAddress,
              eventData.network
            ),
          },
        })

        // Save slug for URL if present
        setNewEventSlug(newEvent.slug)

        // add newly created event to collection
        await addToEventCollection({
          collectionSlug: collectionSlug!,
          eventSlug: newEvent.slug!,
        })

        // Finally
        setLockAddress(lockAddress)

        // Close the drawer upon success
        setIsOpen(false)
      } catch (error) {
        console.error('Error creating or adding event:', error)
        ToastHelper.error('Failed to create or add event to the collection.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={handleSetIsOpen}
      title={addMethod ? 'Add Event' : 'Choose Add Method'}
    >
      <div className="flex flex-col h-full gap-10 mt-10">
        {!addMethod && renderInitialOptions()}
        {addMethod === 'url' && renderAddViaUrl()}
        {addMethod === 'existing' && renderSelectExisting()}
        {addMethod === 'form' && renderCreateForm()}
      </div>
    </Drawer>
  )
}

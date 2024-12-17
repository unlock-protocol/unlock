'use client'

import {
  Button,
  Combobox,
  Disclosure,
  Drawer,
  Input,
  Placeholder,
} from '@unlock-protocol/ui'
import { useUserEvents } from '~/hooks/useUserEvents'
import { Form as EventCreationForm, NewEventForm } from '../event/Form'
import { useEvent } from '~/hooks/useEvent'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAddToEventCollection } from '~/hooks/useEventCollection'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { TransactionDetails } from '../event/NewEvent'
import { locksmith } from '~/config/locksmith'
import { formDataToMetadata } from '~/components/interface/locks/metadata/utils'
import { networks } from '@unlock-protocol/networks'
import { LockDeploying } from '../event/LockDeploying'
import { config } from '~/config/app'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'
import { EventStatus } from '@unlock-protocol/types'

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
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()

  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails>()
  const { addToEventCollection, isAddingToEventCollection } =
    useAddToEventCollection(collectionSlug!)
  const { data: userEvents, isPending: isLoadingUserEvents } = useUserEvents(
    account!
  )

  const [eventUrl, setEventUrl] = useState<string>('')
  const [eventSlug, setEventSlug] = useState<string>('')
  const {
    data: event,
    isLoading: isLoadingEvent,
    error: eventDetailsError,
  } = useEvent({
    slug: eventSlug,
  })
  const [addMethod, setAddMethod] = useState<AddMethod>(null)
  const [isUrlValid, setIsUrlValid] = useState(false)
  const [isEventSelected, setIsEventSelected] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [debouncedEventUrl, setDebouncedEventUrl] = useState(eventUrl)

  const validateUrl = (url: string) => {
    const baseUrl = `${config.unlockApp}/event/`
    let validUrl = url
    let slug = ''

    if (url.startsWith('/')) {
      // If the input starts with a slash, treat it as a slug
      slug = url.slice(1)
      validUrl = `${baseUrl}${slug}`
    } else if (url.startsWith(baseUrl)) {
      slug = url.slice(baseUrl.length)
    } else if (!url.includes('://')) {
      validUrl = `${baseUrl}${url}`
      slug = url
    } else {
      // If it's a full URL but doesn't match our baseUrl, it's invalid
      setIsUrlValid(false)
      setErrorMessage(
        'Invalid URL. Please use a valid Unlock event URL or slug.'
      )
      return
    }

    if (!slug) {
      setIsUrlValid(false)
      setErrorMessage(
        'Invalid URL. Please use a valid Unlock event URL or slug.'
      )
      return
    }

    if (existingEventSlugs.includes(slug)) {
      setIsUrlValid(false)
      setIsDuplicate(true)
      setErrorMessage('This event already exists in the collection.')
      return
    }

    setEventUrl(validUrl)
    setEventSlug(slug)
    setIsUrlValid(true)
    setIsDuplicate(false)
    setErrorMessage(null)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEventUrl(eventUrl)
    }, 600)

    return () => clearTimeout(timer)
  }, [eventUrl])

  useEffect(() => {
    validateUrl(debouncedEventUrl)
  }, [debouncedEventUrl])

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

  useEffect(() => {
    if (eventDetailsError?.message) {
      setErrorMessage(eventDetailsError?.message)
      setIsUrlValid(false)
    }
  }, [eventDetailsError, setErrorMessage])

  const resetFormState = useCallback(() => {
    setEventUrl('')
    setEventSlug('')
    setIsUrlValid(false)
    setIsDuplicate(false)
    setErrorMessage(null)
    setAddMethod(null)
    setIsEventSelected(false)
    setTransactionDetails(undefined)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetFormState()
    }
  }, [isOpen, resetFormState])

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
      resetFormState()
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding event to collection:', error)
      ToastHelper.error('Failed to add event to the collection.')
    } finally {
      setIsSubmitting(false)
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

  const renderAddViaUrl = () => {
    return (
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
            setErrorMessage(null)
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
              autoComplete="off"
              placeholder="https://app.unlock-protocol.com/event/your-event-slug"
              label="Event URL or Slug"
              description="Enter the URL or slug of your Unlock event. You can start with a '/' for slugs."
              value={eventUrl}
              onChange={(e) => {
                const inputValue = e.target.value
                setEventUrl(inputValue)
              }}
              disabled={isSubmitting}
            />
            {debouncedEventUrl && (
              <>
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
                {isUrlValid && !isDuplicate && (
                  <p className="text-sm text-green-500">Valid URL</p>
                )}
              </>
            )}
          </div>
        </Disclosure>

        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={
              !isUrlValid ||
              isDuplicate ||
              !event ||
              isAddingToEventCollection ||
              isSubmitting ||
              isLoadingEvent
            }
          >
            {isSubmitting
              ? 'Submitting...'
              : isLoadingEvent
                ? 'Fetching event details...'
                : eventDetailsError
                  ? 'Event not found'
                  : isManager
                    ? 'Add Event'
                    : 'Submit Event'}
          </Button>
        </div>
      </div>
    )
  }

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
              <Combobox
                options={userEventsOptions}
                onSelect={(selected) => {
                  setEventSlug(selected.value.toString())
                  setIsEventSelected(true)
                }}
                placeholder="Select an event"
                searchPlaceholder="Search events..."
                label="Your Existing Events"
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
    try {
      // First create the event with pending status
      const { data: newEvent } = await locksmith.saveEventData({
        data: {
          ...formDataToMetadata({
            name: eventData.lock.name,
            ...eventData.metadata,
          }),
          ...eventData.metadata,
          status: EventStatus.PENDING,
        },
      })

      // Deploy the lock
      const walletService = await getWalletService(eventData.network)
      walletService.createLock(
        {
          ...eventData.lock,
          name: eventData.lock.name,
          publicLockVersion:
            networks[eventData.network].publicLockVersionToDeploy,
        },
        {},
        async (createLockError, transactionHash) => {
          if (createLockError) {
            console.error('Error creating lock:', createLockError)
            throw createLockError
          }
          if (transactionHash) {
            // Update event with transaction hash
            await locksmith.updateEventData(newEvent.slug, {
              transactionHash,
            })
            setTransactionDetails({
              hash: transactionHash,
              network: eventData.network,
              slug: newEvent.slug,
            })

            // Add newly created event to collection
            await addToEventCollection({
              collectionSlug: collectionSlug!,
              eventSlug: newEvent.slug!,
            })
          }
        }
      )

      // Close the drawer upon success
      setIsOpen(false)
    } catch (error) {
      console.error('Error in event creation process:', error)
      ToastHelper.error('Failed to create or add event to the collection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={(open) => {
        if (!isSubmitting) {
          setIsOpen(open)
          if (!open) {
            resetFormState()
          }
        }
      }}
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

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
import { Form as EventCreationForm } from '../event/Form'
import { useEvent } from '~/hooks/useEvent'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAddToEventCollection } from '~/hooks/useEventCollection'
import { ToastHelper } from '~/components/helpers/toast.helper'

type AddMethod = 'url' | 'existing' | 'form' | null

interface AddEventsToCollectionDrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isManager: boolean
  collectionSlug: string
  existingEventSlugs: string[]
}

export default function AddEventsToCollectionDrawer({
  isOpen,
  setIsOpen,
  isManager,
  collectionSlug,
  existingEventSlugs,
}: AddEventsToCollectionDrawerProps) {
  const { account } = useAuth()
  const { addToEventCollection, isAddingToEventCollection } =
    useAddToEventCollection()
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
  const [hasCheckedUrl, setHasCheckedUrl] = useState<boolean>(false) // New state

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
      await addToEventCollection({ collectionSlug, eventSlug })
      ToastHelper.success('Event added successfully!')
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding event to collection:', error)
      ToastHelper.error('Failed to add event to the collection.')
    }
  }

  const checkEventUrlValidity = () => {
    setHasCheckedUrl(true) // Indicate that validity has been checked
    const slugMatch = eventUrl.match(
      /https:\/\/(?:app|staging-app)\.unlock-protocol\.com\/event\/([^/?#]+)/
    )
    if (slugMatch && slugMatch[1]) {
      setEventSlug(slugMatch[1])
    } else {
      setIsUrlValid(false)
      setIsDuplicate(false)
      setEventSlug('') // Ensure eventSlug is set to a string
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
            Select from Existing Events
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
      <Button onClick={() => setAddMethod('form')} className="w-full">
        Create a New Event
      </Button>
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
          setHasCheckedUrl(false) // Reset the check flag
        }}
        className="self-start"
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
              setEventSlug('') // Reset slug when URL changes
              setHasCheckedUrl(false) // Reset the check flag
            }}
            onBlur={() => {
              // Optional: Uncomment if you want to check on blur
              // checkEventUrlValidity()
            }}
          />
          <Button
            onClick={checkEventUrlValidity}
            disabled={isUrlButtonDisabled || isLoadingEvent}
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
            disabled={!isUrlValid || isAddingToEventCollection}
          >
            {isManager ? 'Add Event' : 'Submit Event'}
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
            disabled={!isEventSelected || isAddingToEventCollection}
          >
            {isManager ? 'Add Event' : 'Submit Event'}
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
      >
        Back
      </Button>
      <Disclosure label="Create a new event" defaultOpen>
        <div className="flex flex-col gap-4">
          <EventCreationForm
            compact={true}
            onSubmit={
              // TODO: Create event and add to collection on submission
              () => console.log('submit')
            }
          />
        </div>
      </Disclosure>
    </div>
  )

  return (
    <Drawer
      isOpen={isOpen}
      setIsOpen={setIsOpen}
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

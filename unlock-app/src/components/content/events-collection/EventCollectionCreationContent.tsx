'use client'

import { useState } from 'react'
import { EventCollectionForm, NewEventCollectionForm } from './Form'
import { useCreateEventCollection } from '~/hooks/useEventCollection'
import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/navigation'
import { AnimationContent } from '~/components/interface/locks/Create/elements/CreateLockFormSummary'

export default function EventCollectionCreationContent() {
  const { createEventCollection, isCreatingEventCollection, creationSuccess } =
    useCreateEventCollection()
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (data: NewEventCollectionForm) => {
    try {
      const response = await createEventCollection(data)
      setCreatedSlug(response.slug!)
    } catch (error) {
      console.error('Error creating event collection:', error)
    }
  }

  if (creationSuccess && createdSlug) {
    return (
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        <div className="flex flex-col items-center text-center">
          <AnimationContent status="deployed" />
          <p className="mt-4 text-2xl font-semibold">
            Collection created successfully!
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/events/${createdSlug}`)}
          >
            Visit Your New Collection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
      <EventCollectionForm
        onSubmit={onSubmit}
        disabled={isCreatingEventCollection}
      />
    </div>
  )
}

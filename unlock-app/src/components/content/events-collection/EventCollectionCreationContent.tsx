'use client'

import { useState } from 'react'
import { EventCollectionForm } from './Form'
import { useCreateEventCollection } from '~/hooks/useEventCollection'
import { CollectionCreationStatus } from './CollectionCreationStatus'

export default function EventCollectionCreationContent() {
  const { createEventCollection, isCreatingEventCollection, success } =
    useCreateEventCollection()
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)

  const onSubmit = async (data: any) => {
    const result = await createEventCollection(data)
    if (result?.slug) {
      setCreatedSlug(result.slug)
    }
  }

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
      <CollectionCreationStatus
        isCreating={isCreatingEventCollection}
        success={success}
        createdSlug={createdSlug}
      />
      {!isCreatingEventCollection && !success && (
        <EventCollectionForm onSubmit={onSubmit} />
      )}
    </div>
  )
}

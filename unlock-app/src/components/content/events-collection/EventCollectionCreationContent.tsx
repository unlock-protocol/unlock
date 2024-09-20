'use client'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { locksmith } from '~/config/locksmith'
import { EventCollectionForm } from './Form'

export default function EventCollectionCreationContent() {
  const onSubmit = async (data: any) => {
    try {
      const response = await locksmith.createEventCollection(data)

      if (response.status !== 201) {
        throw new Error('Failed to create event collection')
      }

      ToastHelper.success('Event collection created')
      console.log('Event collection created:', response.data)
      // TODO: add logic to redirect the user
    } catch (err) {
      ToastHelper.error('An error occurred while creating the event collection')
      console.error('Error creating event collection:', err)
    }
  }

  return (
    <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
      <EventCollectionForm onSubmit={onSubmit} />
    </div>
  )
}

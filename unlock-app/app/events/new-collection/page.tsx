import React from 'react'
import { Metadata } from 'next'
import { AuthRequired } from 'app/Components/ProtectedContent'
import EventCollectionCreationContent from '~/components/content/events-collection/EventCollectionCreationContent'

export const metadata: Metadata = {
  title: 'New Event Collection',
  description: 'Create a new event collection.',
}

const NewEventCollectionPage: React.FC = () => {
  return (
    <AuthRequired>
      <EventCollectionCreationContent />
    </AuthRequired>
  )
}

export default NewEventCollectionPage

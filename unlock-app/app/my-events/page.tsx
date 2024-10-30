import React from 'react'
import { Metadata } from 'next'
import MyEventsContent from '~/components/content/event/MyEventsContent'

export const metadata: Metadata = {
  title: 'My Events | Unlock Events',
  description: 'View and manage your events on Unlock Protocol.',
}

const MyEventsPage: React.FC = () => {
  return <MyEventsContent />
}

export default MyEventsPage

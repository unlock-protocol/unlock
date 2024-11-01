import React from 'react'
import { Metadata } from 'next'
import NewSubscriptionContent from '~/components/content/subscription/NewSubscription'
import { AuthRequired } from 'app/Components/ProtectedContent'

export const metadata: Metadata = {
  title: 'New Subscription | Unlock Protocol',
  description: 'Create a new subscription with Unlock Protocol.',
}

const NewSubscriptionPage: React.FC = () => {
  return (
    <AuthRequired>
      <NewSubscriptionContent />
    </AuthRequired>
  )
}

export default NewSubscriptionPage

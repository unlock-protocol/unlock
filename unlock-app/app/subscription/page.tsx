import React from 'react'
import { Metadata } from 'next'
import SubscriptionContent from '~/components/content/SubscriptionContent'

export const metadata: Metadata = {
  title: 'Onchain Subscriptions',
  description:
    'SUBSCRIPTIONS by Unlock Labs is best way for fans to subscribe to writing, podcasts, music, digital art, and creativity onchain with automatically recurring payments.',
}

const SubscriptionPage: React.FC = () => {
  return <SubscriptionContent />
}

export default SubscriptionPage

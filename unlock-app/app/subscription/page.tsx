import React from 'react'
import { Metadata } from 'next'
import SubscriptionContent from '~/components/content/SubscriptionContent'
import { SHARED_METADATA } from '~/config/seo'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Onchain Subscriptions',
  description:
    'SUBSCRIPTIONS by Unlock Labs is best way for fans to subscribe to writing, podcasts, music, digital art, and creativity onchain with automatically recurring payments.',
  openGraph: {
    ...SHARED_METADATA.openGraph,
    images: [
      {
        alt: 'Onchain subscriptions',
        url: 'https://subscriptions.unlock-protocol.com/',
      },
    ],
  },
}

const SubscriptionPage: React.FC = () => {
  return <SubscriptionContent />
}

export default SubscriptionPage

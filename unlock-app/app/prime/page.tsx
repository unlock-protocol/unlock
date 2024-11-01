import React from 'react'
import { Metadata } from 'next'
import PrimeContent from '~/components/interface/prime/PrimeContent'
import { SHARED_METADATA } from '~/config/seo'

export const metadata: Metadata = {
  ...SHARED_METADATA,
  title: 'Unlock Prime',
  description:
    'Unlock Prime offers enhanced features, monthly ETH rewards, unlimited events, and exclusive partner discounts for members. Bring your onchain experiences to the next level with a premium membership that works across all the apps from Unlock Labs.',
  openGraph: {
    ...SHARED_METADATA.openGraph,
    images: [
      {
        url: 'https://storage.googleapis.com/papyrus_images/f75b33885013fd16274fb54251ef6a2f.jpg',
        alt: 'Unlock Prime',
      },
    ],
  },
}

const PrimeLandingPage: React.FC = () => {
  return <PrimeContent />
}

export default PrimeLandingPage

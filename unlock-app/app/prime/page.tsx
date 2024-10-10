import React from 'react'
import { Metadata } from 'next'
import PrimeContent from '~/components/interface/prime/PrimeContent'

export const metadata: Metadata = {
  title: 'Unlock Prime',
  description:
    'Unlock Prime offers enhanced features, monthly ETH rewards, unlimited events, and exclusive partner discounts for members. Bring your onchain experiences to the next level with a premium membership that works across all the apps from Unlock Labs.',
}

const PrimeLandingPage: React.FC = () => {
  return <PrimeContent />
}

export default PrimeLandingPage

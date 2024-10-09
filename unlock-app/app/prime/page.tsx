import React from 'react'
import { Metadata } from 'next'
import PrimeContent from '~/components/interface/prime/PrimeContent'

export const metadata: Metadata = {
  title: 'Unlock Prime',
  description:
    "Unlock Prime is Unlock Lab's premium membership tier, offering enhanced features and exclusive benefits for creators and communities using Unlock Protocol. It includes everything from Unlock Basic, plus monthly rewards, airdrops, and more tools to build and grow your experiences onchain.",
}

const PrimeLandingPage: React.FC = () => {
  return <PrimeContent />
}

export default PrimeLandingPage

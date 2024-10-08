import React from 'react'
import { Metadata } from 'next'
import PrimeContent from '~/components/interface/prime/PrimeContent'

export const metadata: Metadata = {
  title: 'Unlock Prime',
  description: 'TK',
}

const PrimeLandingPage: React.FC = () => {
  return <PrimeContent />
}

export default PrimeLandingPage

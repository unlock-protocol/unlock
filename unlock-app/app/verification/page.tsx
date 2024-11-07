import React from 'react'
import { Metadata } from 'next'
import VerificationContent from '~/components/content/VerificationContent'

export const metadata: Metadata = {
  title: 'Verification | Unlock Events',
  description: 'Verify your membership to an event on Unlock Protocol.',
}

const VerificationPage: React.FC = () => {
  return <VerificationContent />
}

export default VerificationPage

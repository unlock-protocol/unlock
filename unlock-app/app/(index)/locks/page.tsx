import React from 'react'
import { Metadata } from 'next'
import LocksContent from '~/components/content/lock/LocksContent'

export const metadata: Metadata = {
  title: 'Locks',
  description:
    'A Lock is a membership smart contract you create, deploy, and own on Unlock Protocol.',
}

const LocksPage: React.FC = () => {
  return <LocksContent />
}

export default LocksPage

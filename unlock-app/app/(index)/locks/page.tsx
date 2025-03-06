import React from 'react'
import { Metadata } from 'next'
import { LockList } from '~/components/interface/locks/List/elements/LockList'

export const metadata: Metadata = {
  title: 'Locks',
  description:
    'A Lock is a membership smart contract you create, deploy, and own on Unlock Protocol.',
}

const LocksPage: React.FC = () => {
  return <LockList />
}

export default LocksPage

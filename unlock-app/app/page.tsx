import React from 'react'
import { Metadata } from 'next'
import { LockList } from '~/components/interface/locks/List/elements/LockList'

export const metadata: Metadata = {
  title: 'Creator Dashboard | Unlock Protocol',
  description:
    'Deploy, manage, and update locks, view key owners, and withdraw funds from your memberships and subscriptions.',
}

const HomePage: React.FC = () => {
  return <LockList />
}

export default HomePage

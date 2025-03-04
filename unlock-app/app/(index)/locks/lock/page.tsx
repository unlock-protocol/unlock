'use client'

import React from 'react'
import { ManageLockContent } from '~/components/interface/locks/Manage'
import { useAuthenticate } from '~/hooks/useAuthenticate'

const ManageLockPage: React.FC = () => {
  const { account: owner } = useAuthenticate()

  if (!owner) {
    return <div>Loading...</div>
  }

  return <ManageLockContent owner={owner} />
}

export default ManageLockPage

import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import ManageLockPage from '~/components/interface/locks/Manage'

const LockByAddress: NextPage = () => {
  return (
    <BrowserOnly>
      <ManageLockPage />
    </BrowserOnly>
  )
}

export default LockByAddress

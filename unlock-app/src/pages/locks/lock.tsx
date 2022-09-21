import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import ManageLockPage from '~/components/interface/locks/Manage'
import { AppFooter } from '~/components/interface/AppFooter'

const LockByAddress: NextPage = () => {
  return (
    <BrowserOnly>
      <ManageLockPage />
      <AppFooter />
    </BrowserOnly>
  )
}

export default LockByAddress

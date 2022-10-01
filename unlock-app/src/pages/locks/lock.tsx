import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import ManageLockPage from '~/components/interface/locks/Manage'
import { AppFooter } from '~/components/interface/AppFooter'
import { AppHeader } from '~/components/interface/AppHeader'

const LockByAddress: NextPage = () => {
  return (
    <BrowserOnly>
      <AppHeader />
      <ManageLockPage />
      <AppFooter />
    </BrowserOnly>
  )
}

export default LockByAddress

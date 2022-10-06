import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import ManageLockPage from '~/components/interface/locks/Manage'
import { AppLayout } from '~/components/interface/layouts/AppLayout'

const LockByAddress: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <ManageLockPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default LockByAddress

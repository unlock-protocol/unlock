import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppFooter } from '~/components/interface/AppFooter'
import LocksListPage from '~/components/interface/locks/List'

const Locks: NextPage = () => {
  return (
    <BrowserOnly>
      <LocksListPage />
      <AppFooter />
    </BrowserOnly>
  )
}

export default Locks

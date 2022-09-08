import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { CreateLockPage } from '~/components/interface/lock/create'

const Checkout: NextPage = () => {
  return (
    <BrowserOnly>
      <CreateLockPage />
    </BrowserOnly>
  )
}

export default Checkout

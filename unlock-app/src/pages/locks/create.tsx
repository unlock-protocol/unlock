import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import CreateLockPage from '~/components/interface/locks/Create'
import { AppHeader } from '~/components/interface/AppHeader'

const Create: NextPage = () => {
  return (
    <BrowserOnly>
      <AppHeader />
      <CreateLockPage />
    </BrowserOnly>
  )
}

export default Create

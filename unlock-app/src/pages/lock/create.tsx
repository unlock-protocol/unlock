import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import CreateLockPage from '~/components/interface/lock/Create'

const Create: NextPage = () => {
  return (
    <BrowserOnly>
      <CreateLockPage />
    </BrowserOnly>
  )
}

export default Create

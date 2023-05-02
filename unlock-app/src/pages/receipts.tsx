import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import ReceiptsPage from '~/components/interface/Receipts'

const Receipts: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <ReceiptsPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default Receipts

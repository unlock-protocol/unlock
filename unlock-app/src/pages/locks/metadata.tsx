import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { LockMetadataPage } from '~/components/interface/locks/metadata'

const LockMetadata: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <LockMetadataPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default LockMetadata

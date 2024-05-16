import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import Deploy from '~/components/interface/locks/P00ls/Deploy'

const CreateP00lsMembership: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <Deploy />
      </AppLayout>
    </BrowserOnly>
  )
}

export default CreateP00lsMembership

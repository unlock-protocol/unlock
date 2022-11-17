import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import LockSettingsPage from '~/components/interface/locks/Settings'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { useRouter } from 'next/router'

const Create: NextPage = () => {
  const { query } = useRouter()
  const { address, network } = query ?? {}

  return (
    <BrowserOnly>
      <AppLayout authRequired={true} showHeader={false}>
        <LockSettingsPage
          lockAddress={address! as string}
          network={parseInt((network as string)!, 10)}
        />
      </AppLayout>
    </BrowserOnly>
  )
}

export default Create

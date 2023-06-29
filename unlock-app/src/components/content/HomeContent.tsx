import React, { useEffect } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import { AppLayout } from '../interface/layouts/AppLayout'
import { useRouter } from 'next/router'
import { useAuth } from '~/contexts/AuthenticationContext'
import Loading from '../interface/Loading'
import { Launcher } from '../interface/Launcher'

export const HomeContent = () => {
  const router = useRouter()
  const { account } = useAuth()

  useEffect(() => {
    if (account) {
      router.push('/locks')
    }
  })

  return (
    <AppLayout authRequired={false} showLinks={false}>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>
      {account && <Loading />}
      {!account && <Launcher />}
    </AppLayout>
  )
}

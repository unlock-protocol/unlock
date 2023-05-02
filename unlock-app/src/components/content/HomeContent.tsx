import React, { useEffect } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import Loading from '../interface/Loading'
import { AppLayout } from '../interface/layouts/AppLayout'
import { config } from '~/config/app'
import { useRouter } from 'next/router'

export const HomeContent = () => {
  const router = useRouter()
  useEffect(() => {
    // In dev, redirect to dashboard, otherwise to static site!
    if (
      ['localhost', '127.0.0.1', '0.0,0,0'].indexOf(window.location.hostname) >
      -1
    ) {
      router.push('/locks')
    } else {
      router.push(config.unlockStaticUrl)
    }
  })
  return (
    <AppLayout authRequired={false} showLinks={false}>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>
      <Loading />
    </AppLayout>
  )
}

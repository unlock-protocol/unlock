import React, { useEffect } from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import withConfig from '../../utils/withConfig'
import Loading from '../interface/Loading'
import UnlockPropTypes from '../../propTypes'
import { AppLayout } from '../interface/layouts/AppLayout'

export const HomeContent = ({ config }) => {
  useEffect(() => {
    // In dev, redirect to dashboard, otherwise to static site!
    if (
      ['localhost', '127.0.0.1', '0.0,0,0'].indexOf(window.location.hostname) >
      -1
    ) {
      window.location.assign('/locks')
    } else {
      window.location.assign(config.unlockStaticUrl)
    }
  })
  return (
    <AppLayout forContent authRequired={false} showLinks={false}>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>
      <Loading />
    </AppLayout>
  )
}

HomeContent.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(HomeContent)

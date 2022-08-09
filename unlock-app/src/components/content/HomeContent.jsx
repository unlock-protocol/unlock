import React, { useEffect } from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { TwitterTags } from '../page/TwitterTags'
import { OpenGraphTags } from '../page/OpenGraphTags'
import withConfig from '../../utils/withConfig'
import Loading from '../interface/Loading'
import UnlockPropTypes from '../../propTypes'

export const HomeContent = ({ config }) => {
  useEffect(() => {
    // In dev, redirect to dashboard, otherwise to static site!
    if (
      ['localhost', '127.0.0.1', '0.0,0,0'].indexOf(window.location.hostname) >
      -1
    ) {
      window.location.assign('/dashboard')
    } else {
      window.location.assign(config.unlockStaticUrl)
    }
  })
  return (
    <Layout forContent>
      <Head>
        <title>{pageTitle()}</title>
        <TwitterTags />
        <OpenGraphTags />
      </Head>
      <Loading />
    </Layout>
  )
}

HomeContent.propTypes = {
  config: UnlockPropTypes.configuration.isRequired,
}

export default withConfig(HomeContent)

import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'

export const EventContent = () => {
  const router = useRouter()
  if (!router.query) {
    return <LoadingIcon></LoadingIcon>
  }

  const { lockAddress, network } = router.query
  const showDetails = lockAddress && network

  const handleCreateEvent = () => {
    router.push('/event/new')
  }

  return (
    <AppLayout showLinks={false} authRequired={false} title="">
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>
      {!showDetails && (
        <EventLandingPage handleCreateEvent={handleCreateEvent} />
      )}
      {showDetails && (
        <div className="m-auto md:w-3/4">
          <EventDetails
            lockAddress={lockAddress.toString()}
            network={parseInt(network.toString(), 10)}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default EventContent

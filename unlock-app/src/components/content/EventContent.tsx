import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useGetLockSettingsBySlug } from '~/hooks/useLockSettings'

export const EventContent = () => {
  const router = useRouter()

  const { s: slug } = router.query
  const {
    isFetching,
    isLoading,
    data: lockSettings,
  } = useGetLockSettingsBySlug(slug as string)

  const loading = isFetching && isLoading

  const handleCreateEvent = () => {
    router.push('/event/new')
  }

  if (!router.query || loading) {
    return <LoadingIcon />
  }

  const lockAddress = lockSettings
    ? lockSettings.lockAddress
    : (router.query.lockAddress as string)

  const network = lockSettings
    ? lockSettings.network
    : parseInt(router.query?.network?.toString() as string, 10)

  const showDetails =
    (router.query?.lockAddress && router.query?.network) || (slug && !loading)

  return (
    <AppLayout
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-unlock-events.svg"
    >
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>
      {!showDetails && (
        <EventLandingPage handleCreateEvent={handleCreateEvent} />
      )}
      {showDetails && lockAddress && network && (
        <EventDetails
          lockAddress={lockAddress}
          network={network}
          isLoading={loading}
        />
      )}
    </AppLayout>
  )
}

export default EventContent

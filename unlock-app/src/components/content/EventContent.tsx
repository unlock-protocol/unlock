import React, { useEffect, useState } from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useGetLockSettingsBySlug } from '~/hooks/useLockSettings'

interface EventContentProps {
  lockAddress?: string
  network?: string | number
}

export const EventContent = () => {
  const router = useRouter()
  const [params, setParams] = useState<EventContentProps>()

  const [, slug] = router?.asPath?.split('#') ?? []

  const {
    isFetching,
    isLoading,
    data: lockSettings,
  } = useGetLockSettingsBySlug(slug)

  useEffect(() => {
    if (router.query.lockAddress && router.query.network) {
      setParams({
        lockAddress: router.query.lockAddress as string,
        network: router.query.network as string,
      })
    } else {
      setParams({
        lockAddress: lockSettings?.lockAddress,
        network: lockSettings?.network,
      })
    }
  }, [lockSettings, router.query])

  const loading = isFetching && isLoading

  const showDetails =
    (params?.lockAddress && params?.network) || (slug && !loading)

  const handleCreateEvent = () => {
    router.push('/event/new')
  }

  if (!router.query || loading) {
    return <LoadingIcon />
  }

  const lockAddress = params?.lockAddress?.toString() as string
  const network = parseInt(params?.network?.toString() as string, 10)

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

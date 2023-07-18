import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { EventLandingPage } from './event/EventLandingPage'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'
import { NextSeo } from 'next-seo'
import { config } from '~/config/app'

export const EventContent = () => {
  const router = useRouter()

  const { lockAddress, network, isLoading } =
    useRouterQueryForLockAddressAndNetworks()

  const handleCreateEvent = () => {
    router.push(
      'http://unlock-protocol-1.hubspotpagebuilder.com/unlock-protocol-newsletter-signup-0'
    )
  }

  if (isLoading) {
    return <LoadingIcon />
  }

  const showDetails = lockAddress && network

  const locksmithEventOG = new URL(
    `/v2/og/event/${network}/locks/${lockAddress}`,
    config.locksmithHost
  ).toString()

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
      <NextSeo
        title="Unlock Events"
        description="Unlock Protocol empowers everyone to create events the true web3 way. Deploy a contract, sell tickets as NFTs, and perform check-in with a dedicated QR code. We got it covered."
        openGraph={{
          images: [
            {
              alt: 'Event',
              url: locksmithEventOG,
            },
          ],
        }}
      />
      {!showDetails && (
        <EventLandingPage handleCreateEvent={handleCreateEvent} />
      )}
      {showDetails && lockAddress && network && (
        <EventDetails lockAddress={lockAddress} network={network} />
      )}
    </AppLayout>
  )
}

export default EventContent

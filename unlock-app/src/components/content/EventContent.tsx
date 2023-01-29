import React from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import Link from 'next/link'
import EventDetails from './event/EventDetails'

export const EventContent = () => {
  const router = useRouter()
  if (!router.query) {
    return <LoadingIcon></LoadingIcon>
  }

  return (
    <AppLayout showLinks={false} authRequired={false} title="">
      <Head>
        <title>{pageTitle('Event')}</title>
      </Head>
      <div className="md:w-3/4 m-auto">
        {(!router.query.lockAddress || !router.query.network) && (
          <p>
            Use Unlock to sell tickets for your event:{' '}
            <Link className="underline" href="/locks/create">
              start by deploying your contract.
            </Link>
          </p>
        )}
        {router.query.lockAddress && router.query.network && (
          <EventDetails
            lockAddress={router.query.lockAddress.toString()}
            network={parseInt(router.query.network.toString(), 10)}
          />
        )}
      </div>
    </AppLayout>
  )
}

export default EventContent

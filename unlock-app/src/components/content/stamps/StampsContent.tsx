import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadingIcon from '~/components/interface/Loading'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'
import StampsLanding from './StampsLanding'

export const StampContent = () => {
  const router = useRouter()

  const { lockAddress, network } = router.query as any
  const showDetails = !!(router.query && lockAddress && network)

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const handleCreateStamp = () => {
    router.push('/stamps/new')
  }

  if (!router.query) {
    return <LoadingIcon />
  }

  return (
    <AppLayout
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/certification"
      logoImageUrl="/images/svg/logo-unlock-stamps.svg"
    >
      <Head>
        <title>
          {metadata ? pageTitle(`${metadata?.name} | 'Stamps`) : 'Stamps'}
        </title>
        {metadata && (
          <>
            <meta property="og:title" content={metadata?.name} />
            <meta property="og:image" content={metadata.image} />
          </>
        )}
      </Head>
      {!showDetails && <StampsLanding handleCreateStamp={handleCreateStamp} />}
    </AppLayout>
  )
}

export default StampContent

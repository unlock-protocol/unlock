import React from 'react'
import Head from 'next/head'
import { CertificationDetails } from './CertificationDetails'
import { CertificationLanding } from './CertificationLanding'
import { useRouter } from 'next/router'
import LoadingIcon from '~/components/interface/Loading'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'
import { useGetLockSettingsBySlug } from '~/hooks/useLockSettings'

export const CertificationContent = () => {
  const router = useRouter()

  const { s: slug = '', tokenId } = router.query

  const {
    isFetching,
    isLoading,
    data: lockSettings,
  } = useGetLockSettingsBySlug(slug as string)

  const lockAddress = (
    lockSettings
      ? lockSettings?.lockAddress?.toString()
      : router.query.lockAddress
  ) as string

  const network = (
    lockSettings
      ? lockSettings.network
      : parseInt(router.query?.network?.toString() as string, 10)
  ) as number

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const loading = isFetching && isLoading

  const showDetails =
    (router.query?.lockAddress && router.query?.network) || (slug && !loading)

  if (!router.query || loading) {
    return <LoadingIcon />
  }

  const handleCreateCertification = () => {
    router.push('/certification/new')
  }

  return (
    <AppLayout
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/certification"
      logoImageUrl="/images/svg/logo-unlock-certificate.svg"
    >
      <Head>
        <title>
          {metadata
            ? pageTitle(`${metadata?.name} | 'Certification`)
            : 'Certification'}
        </title>
        {metadata && (
          <>
            <meta property="og:title" content={metadata?.name} />
            <meta property="og:image" content={metadata.image} />
          </>
        )}
      </Head>
      {!showDetails && (
        <CertificationLanding
          handleCreateCertification={handleCreateCertification}
        />
      )}
      {showDetails && (
        <div className="m-auto md:w-3/4">
          <CertificationDetails
            lockAddress={lockAddress}
            network={network}
            tokenId={tokenId as string}
            isLoading={loading}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default CertificationContent

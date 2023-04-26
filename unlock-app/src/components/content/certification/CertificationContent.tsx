import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { CertificationDetails } from './CertificationDetails'
import { CertificationLanding } from './CertificationLanding'
import { useRouter } from 'next/router'
import LoadingIcon from '~/components/interface/Loading'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'
import { useGetLockSettingsBySlug } from '~/hooks/useLockSettings'
import { getSlugParamsFromUrl } from '~/utils/url'

interface CertificationContentProps {
  lockAddress?: string
  network?: string | number
  tokenId?: string
}

export const CertificationContent = () => {
  const router = useRouter()

  const [params, setParams] = useState<CertificationContentProps>()

  const { hash: slug, params: queryParams } = getSlugParamsFromUrl(
    router.asPath
  )

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
        tokenId: router.query.tokenId as string,
      })
    } else {
      setParams({
        lockAddress: lockSettings?.lockAddress,
        network: lockSettings?.network,
        tokenId: queryParams?.tokenId as string,
      })
    }
  }, [lockSettings, queryParams.tokenId, router.query])

  const lockAddress = params?.lockAddress?.toString() as string
  const network = parseInt(params?.network?.toString() as string, 10)
  const tokenId = params?.tokenId as string

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const loading = isFetching && isLoading

  const showDetails =
    (!!params?.lockAddress && !!params?.network) ||
    (slug?.length > 0 && !loading)

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
            tokenId={tokenId}
            isLoading={loading}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default CertificationContent

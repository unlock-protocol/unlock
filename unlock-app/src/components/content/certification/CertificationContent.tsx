import React from 'react'
import Head from 'next/head'
import { CertificationDetails } from './CertificationDetails'
import { CertificationLanding } from './CertificationLanding'
import { useRouter } from 'next/router'
import LoadingIcon from '~/components/interface/Loading'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'

export const CertificationContent = () => {
  const router = useRouter()

  const { lockAddress, network, tokenId } = router.query as any
  const showDetails = !!(router.query && lockAddress && network)

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const handleCreateCertification = () => {
    router.push('/certification/new')
  }

  if (!router.query) {
    return <LoadingIcon />
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
            lockAddress={lockAddress as string}
            network={Number(network)}
            tokenId={tokenId as string}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default CertificationContent

import React from 'react'
import Head from 'next/head'
import { CertificationDetails } from './CertificationDetails'
import { CertificationLanding } from './CertificationLanding'
import { useRouter } from 'next/router'
import LoadingIcon from '~/components/interface/Loading'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouter'

export const CertificationContent = () => {
  const router = useRouter()

  const { isLoading, lockAddress, network, tokenId } =
    useRouterQueryForLockAddressAndNetworks()

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const showDetails = lockAddress && network

  if (!lockAddress && !network) {
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
            isLoading={isLoading}
          />
        </div>
      )}
    </AppLayout>
  )
}

export default CertificationContent

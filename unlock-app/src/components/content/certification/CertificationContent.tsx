'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingIcon from '~/components/interface/Loading'
import { pageTitle } from '~/constants'
import { useMetadata } from '~/hooks/metadata'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'
import { CertificationDetails } from './CertificationDetails'
import { CertificationLanding } from './CertificationLanding'

export const CertificationContent = () => {
  const router = useRouter()

  const { lockAddress, network, tokenId, isLoading } =
    useRouterQueryForLockAddressAndNetworks()

  const { data: metadata } = useMetadata({
    lockAddress: lockAddress as string,
    network: network as number,
  })

  const showDetails = lockAddress && network

  useEffect(() => {
    document.title = metadata
      ? pageTitle(`${metadata?.name} | Certification`)
      : pageTitle('Certification')
  }, [metadata])

  if (isLoading) {
    return <LoadingIcon />
  }

  const handleCreateCertification = () => {
    router.push('/certification/new')
  }

  return (
    <>
      {metadata && (
        <>
          <meta property="og:title" content={metadata?.name} />
          <meta property="og:image" content={metadata.image} />
        </>
      )}
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
          />
        </div>
      )}
    </>
  )
}

export default CertificationContent

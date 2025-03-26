import { notFound } from 'next/navigation'
import { CertificationPreviewContent } from '~/components/content/certification/CertificationPreview'
import { locksmith } from '~/config/locksmith'

export interface CertificationPreviewPageProps {
  params: {
    slug: string[]
  }
}

const CertificationPreviewPage = async ({
  params,
}: CertificationPreviewPageProps) => {
  const [certSlug, tokenId] = params.slug

  let lockAddress, network

  try {
    const certificationDetail = await locksmith.getLockSettingsBySlug(certSlug)

    // Extract the data from certificationDetail response
    if (certificationDetail?.data) {
      lockAddress = certificationDetail.data.lockAddress
      network = certificationDetail.data.network
    }
  } catch (err) {
    console.error('Error fetching certificate by slug:', err)
  }

  // If we have both needed values, show the certificate
  if (lockAddress && network) {
    return (
      <CertificationPreviewContent
        lockAddress={lockAddress}
        network={network}
        tokenId={tokenId}
      />
    )
  }

  // Otherwise direct to a 404 page
  notFound()
}

export default CertificationPreviewPage

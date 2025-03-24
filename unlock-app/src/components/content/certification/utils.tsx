import { Metadata } from '~/components/interface/locks/metadata/utils'

interface CertificationUrlProps {
  metadata?: Partial<Metadata>
  lockAddress: string
  network: string | number
  tokenId?: string | number
}

export const getCertificationPath = ({
  metadata,
  tokenId,
}: CertificationUrlProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `/certification/${slug}`
  }

  if (tokenId) {
    return `/certification/${slug}/${tokenId}`
  }

  return `/certification/${slug}`
}

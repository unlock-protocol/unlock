import { Metadata } from '~/components/interface/locks/metadata/utils'

interface CertificationUrlProps {
  metadata?: Partial<Metadata>
  lockAddress: string
  network: string | number
  tokenId?: string | number
}

export const getCertificationPath = ({
  metadata,
  lockAddress,
  network,
  tokenId,
}: CertificationUrlProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `/certification?s=${slug}`
  }

  if (tokenId) {
    return `/certification?lockAddress=${lockAddress}&network=${network}&tokenId=${tokenId}`
  }

  return `/certification?lockAddress=${lockAddress}&network=${network}`
}

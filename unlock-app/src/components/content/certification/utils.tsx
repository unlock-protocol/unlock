import { Metadata } from '~/components/interface/locks/metadata/utils'

interface CertificationUrlProps {
  metadata?: Partial<Metadata>
  lockAddress: string
  network: string | number
}

export const getCertificationUrl = ({
  metadata,
  lockAddress,
  network,
}: CertificationUrlProps): string => {
  const slug = metadata?.slug

  if (slug) {
    return `/certification?s=${slug}`
  }
  return `/certification?lockAddress=${lockAddress}&network=${network}`
}

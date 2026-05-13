import type {
  Attribute,
  Metadata,
} from '~/components/interface/locks/metadata/utils'

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

const normalizeTraitType = (traitType = '') => {
  return traitType
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const hiddenCertificationTraits = new Set(['minted', 'certification issuer'])

const recipientTraits = new Set([
  'attendee',
  'attendee name',
  'full name',
  'fullname',
  'holder',
  'holder name',
  'name',
  'recipient',
  'recipient name',
])

export const getCustomCertificationMetadata = (
  metadata?: Partial<Metadata>
): Attribute[] => {
  return (
    metadata?.attributes?.filter((attribute) => {
      const normalizedTraitType = normalizeTraitType(attribute.trait_type)
      return (
        !!attribute.trait_type &&
        attribute.value !== undefined &&
        attribute.value !== null &&
        `${attribute.value}`.trim() !== '' &&
        !hiddenCertificationTraits.has(normalizedTraitType)
      )
    }) || []
  )
}

export const getCertificationRecipientName = (
  customMetadata: Attribute[]
): string | undefined => {
  const recipient = customMetadata.find((attribute) =>
    recipientTraits.has(normalizeTraitType(attribute.trait_type))
  )

  return recipient?.value?.toString()
}

export const getCertificateDetailsMetadata = (
  customMetadata: Attribute[]
): Attribute[] => {
  return customMetadata.filter(
    (attribute) =>
      !recipientTraits.has(normalizeTraitType(attribute.trait_type))
  )
}

export type CertificationMetadataAttribute = {
  trait_type?: string
  value?: string | number | null
}

export type CertificationCustomMetadataAttribute = {
  trait_type: string
  value: string | number
}

export const skippedCertificationMetadataTraits = new Set([
  'Minted',
  'certification_issuer',
])

export const getCertificationCustomMetadata = (
  attributes?: CertificationMetadataAttribute[] | null
) =>
  attributes?.filter(
    (
      attr: CertificationMetadataAttribute
    ): attr is CertificationCustomMetadataAttribute =>
      !!attr.trait_type &&
      !skippedCertificationMetadataTraits.has(attr.trait_type) &&
      attr.value !== undefined &&
      attr.value !== null &&
      attr.value !== ''
  ) || []

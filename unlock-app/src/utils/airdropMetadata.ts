export type AirdropMetadata = Record<
  'public' | 'protected',
  Record<string, string>
>

const nonMetadataFields = new Set([
  'manager',
  'neverExpire',
  'count',
  'expiration',
  'balance',
  'line',
  'wallet',
])

export const airdropMemberToMetadata = (
  member: Record<string, unknown>
): AirdropMetadata => {
  return Object.entries(member).reduce<AirdropMetadata>(
    (result, [key, value]) => {
      if (nonMetadataFields.has(key) || value === undefined || value === null) {
        return result
      }

      const stringValue = String(value)
      if (!stringValue.trim()) {
        return result
      }

      const [name, designation] = key.split('.')
      if (!name) {
        return result
      }

      if (designation === 'public') {
        result.public[name] = stringValue
      } else {
        result.protected[name] = stringValue
      }

      return result
    },
    {
      protected: {},
      public: {},
    }
  )
}

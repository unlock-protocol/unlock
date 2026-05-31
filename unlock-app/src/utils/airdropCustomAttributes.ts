export interface AirdropCustomAttribute {
  name: string
  value: string
  isPublic: boolean
}

export const getAirdropCustomAttributeKey = (
  name: string,
  isPublic: boolean
) => {
  const normalizedName = name.trim().replace(/\./g, '_')
  if (!normalizedName) {
    return ''
  }
  return isPublic ? `${normalizedName}.public` : normalizedName
}

export const buildAirdropCustomMetadata = (
  customAttributes: AirdropCustomAttribute[]
) => {
  return customAttributes.reduce<Record<string, string>>(
    (metadata, { name, value, isPublic }) => {
      const key = getAirdropCustomAttributeKey(name, isPublic)
      const trimmedValue = value.trim()
      if (!key || !trimmedValue) {
        return metadata
      }
      metadata[key] = trimmedValue
      return metadata
    },
    {}
  )
}

export const validateAirdropCustomAttributes = (
  customAttributes: AirdropCustomAttribute[]
) => {
  const keys = new Set<string>()

  for (const attribute of customAttributes) {
    const hasName = attribute.name.trim().length > 0
    const hasValue = attribute.value.trim().length > 0

    if (hasName !== hasValue) {
      return 'Custom attributes need both a name and a value.'
    }

    const key = getAirdropCustomAttributeKey(attribute.name, attribute.isPublic)
    if (!key) {
      continue
    }

    if (keys.has(key)) {
      return 'Custom attribute names must be unique.'
    }
    keys.add(key)
  }

  return null
}

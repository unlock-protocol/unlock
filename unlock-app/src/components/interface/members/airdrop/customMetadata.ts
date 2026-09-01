export type CustomMetadataField = {
  name?: string
  value?: string
  visibility?: 'protected' | 'public'
}

export const applyCustomMetadataFields = <
  T extends { customFields?: CustomMetadataField[] },
>(
  member: T
): Omit<T, 'customFields'> & Record<string, string> => {
  const { customFields = [], ...memberData } = member

  return customFields.reduce<Record<string, unknown>>(
    (result, { name, value, visibility }) => {
      const fieldName = name?.trim()
      const fieldValue = value?.trim()

      if (!fieldName || !fieldValue) {
        return result
      }

      const designation = visibility === 'public' ? 'public' : 'protected'

      return {
        ...result,
        [`${fieldName}.${designation}`]: fieldValue,
      }
    },
    memberData
  ) as Omit<T, 'customFields'> & Record<string, string>
}

type SchemaField = {
  type: string
  name: string
  displayName: string
}

const displayNames: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  dateOfBirth: 'Date of birth',
  grade: 'Grade',
  thesis: 'Thesis',
}

const parseSchema = (schema: string): SchemaField[] => {
  return schema.split(',').map((field) => {
    const trimmed = field.trim()
    const lastSpaceIndex = trimmed.lastIndexOf(' ')
    const name = trimmed.slice(lastSpaceIndex + 1)

    return {
      type: trimmed.slice(0, lastSpaceIndex),
      name,
      displayName: name in displayNames ? displayNames[name] : name,
    }
  })
}

export const transformDataToEas = (
  formData: Record<string, any>,
  schema: string
) => {
  const parsedSchema = parseSchema(schema)

  return parsedSchema.map((field) => {
    let value = formData[field.name]

    // Convert date strings to Unix timestamps for uint256 types
    if (field.type.startsWith('uint') && value) {
      const timestamp = Math.floor(new Date(value).getTime() / 1000)
      value = BigInt(Math.abs(timestamp))
    }

    // Convert boolean for bool types
    if (field.type.startsWith('bool')) {
      value = Boolean(value)
    }
    return {
      name: field.name,
      value: value,
      type: field.type,
    }
  })
}
export default parseSchema

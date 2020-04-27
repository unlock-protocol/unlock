import { UserMetadata, MetadataInput } from '../unlockTypes'

export function getPublicInputs(
  inputs: MetadataInput[]
): { [name: string]: boolean } {
  let result: { [key: string]: boolean } = {}
  inputs.forEach(input => (result[input.name] = input.public || false))
  return result
}

export function formResultToMetadata(
  formResult: { [key: string]: string },
  inputs: MetadataInput[]
): UserMetadata {
  let result: UserMetadata = {
    publicData: {},
    protectedData: {},
  }

  const publicInputs = getPublicInputs(inputs)
  Object.keys(formResult).forEach(name => {
    if (publicInputs[name]) {
      result.publicData![name] = formResult[name]
    } else {
      result.protectedData![name] = formResult[name]
    }
  })

  return result
}

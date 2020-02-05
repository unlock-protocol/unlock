import { UserMetadata, MetadataInput } from '../unlockTypes'

export function getProtectedInputs(
  inputs: MetadataInput[]
): { [name: string]: boolean } {
  let result: { [key: string]: boolean } = {}
  inputs.forEach(input => (result[input.name] = input.protected || false))
  return result
}

export function formResultToMetadata(
  formResult: { [key: string]: string },
  inputs: MetadataInput[]
): UserMetadata {
  let result: UserMetadata = {
    publicData: {},
    privateData: {},
  }

  const protectedInputs = getProtectedInputs(inputs)
  Object.keys(formResult).forEach(name => {
    if (protectedInputs[name]) {
      result.privateData![name] = formResult[name]
    } else {
      result.publicData![name] = formResult[name]
    }
  })

  return result
}

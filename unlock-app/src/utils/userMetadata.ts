import { UserMetadata } from '../unlockTypes'
import { MetadataInputType } from '@unlock-protocol/core'

export function getPublicInputs(inputs: MetadataInputType[]): {
  [name: string]: boolean
} {
  const result: { [key: string]: boolean } = {}
  inputs.forEach((input) => (result[input.name] = input.public || false))
  return result
}

export function formResultToMetadata(
  formResult: { [key: string]: string },
  inputs: MetadataInputType[]
): UserMetadata {
  const result: UserMetadata = {
    publicData: {},
    protectedData: {},
  }

  const publicInputs = getPublicInputs(inputs)
  Object.keys(formResult).forEach((name) => {
    if (publicInputs[name]) {
      result.publicData![name] = formResult[name]
    } else {
      result.protectedData![name] = formResult[name]
    }
  })

  return result
}

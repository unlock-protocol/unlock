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

interface StoredUserMetadata {
  public?: Record<string, string>
  protected?: Record<string, string>
}

const normalizeMetadataKeys = (metadata?: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(metadata || {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ])
  )
}

export function userMetadataToFormResult(
  metadata: StoredUserMetadata,
  inputs: MetadataInputType[]
): Record<string, string> {
  const publicMetadata = normalizeMetadataKeys(metadata.public)
  const protectedMetadata = normalizeMetadataKeys(metadata.protected)

  return inputs.reduce<Record<string, string>>((result, input) => {
    const normalizedName = input.name.toLowerCase()
    const savedValue = input.public
      ? (publicMetadata[normalizedName] ?? protectedMetadata[normalizedName])
      : (protectedMetadata[normalizedName] ?? publicMetadata[normalizedName])

    if (savedValue !== undefined) {
      result[input.name] = savedValue
    }

    return result
  }, {})
}

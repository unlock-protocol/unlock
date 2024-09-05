import networks from '../../src'

const expectedKeys = Object.keys(networks['1'])

export const validateKeys = (network) => {
  const missingProperties: string[] = []
  expectedKeys.forEach((key) => {
    if (!(key in network)) {
      missingProperties.push(key as string)
    }
  })
  return missingProperties
}

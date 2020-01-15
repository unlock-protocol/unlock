import { generateKeyMetadataPayload } from '../../typedData/lockOwnerMetadata'

const owner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const baseData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    KeyMetadata: [],
  },
  domain: {
    name: 'Unlock',
    version: '1',
  },
  primaryType: 'KeyMetadata',
}

const singleProperty = {
  motd: 'Be formless, shapeless -- like water.',
}

const multiProperty = {
  checkedInAt: '1579099703',
  verifier: '0xe29ec42F0b620b1c9A716f79A02E9DC5A5f5F98a',
  coords: '37°14′0″N 115°48′30″W',
}

describe('Key metadata payload generation (lock owner)', () => {
  it('should generate a payload for a single property', () => {
    expect.assertions(1)

    expect(generateKeyMetadataPayload(owner, singleProperty)).toEqual({
      ...baseData,
      message: {
        KeyMetaData: {
          owner,
          ...singleProperty,
        },
      },
    })
  })

  it('should generate a payload for multiple properties', () => {
    expect.assertions(1)

    expect(generateKeyMetadataPayload(owner, multiProperty)).toEqual({
      ...baseData,
      message: {
        KeyMetaData: {
          owner,
          ...multiProperty,
        },
      },
    })
  })
})

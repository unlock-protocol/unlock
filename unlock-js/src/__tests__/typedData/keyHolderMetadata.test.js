import generateKeyHolderMetadataPayload from '../../typedData/keyHolderMetadata'

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
    UserMetaData: [],
  },
  domain: {
    name: 'Unlock',
    version: '1',
  },
  primaryType: 'UserMetaData',
}

const privateData = {
  favoriteColor: 'blue',
  age: '7',
}

const publicData = {
  massOfMoon: '7.34767309 × 1022 kilograms',
  species: 'dinosaur',
}

describe('Key holder metadata payload generation', () => {
  it('returns an appropriate value with empty metadata input', () => {
    expect.assertions(1)

    expect(generateKeyHolderMetadataPayload(owner, {})).toEqual({
      ...baseData,
      message: {
        owner,
        data: {
          public: {},
          private: {},
        },
      },
    })
  })

  it('returns an appropriate value with only private metadata', () => {
    expect.assertions(1)

    expect(generateKeyHolderMetadataPayload(owner, { privateData })).toEqual({
      ...baseData,
      message: {
        owner,
        data: {
          public: {},
          private: privateData,
        },
      },
    })
  })

  it('returns an appropriate value with only public metadata', () => {
    expect.assertions(1)

    expect(generateKeyHolderMetadataPayload(owner, { publicData })).toEqual({
      ...baseData,
      message: {
        owner,
        data: {
          public: publicData,
          private: {},
        },
      },
    })
  })

  it('returns an appropriate value with both public and private metadata', () => {
    expect.assertions(1)

    expect(
      generateKeyHolderMetadataPayload(owner, { publicData, privateData })
    ).toEqual({
      ...baseData,
      message: {
        owner,
        data: {
          public: publicData,
          private: privateData,
        },
      },
    })
  })
})

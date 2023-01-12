import { generateKeyHolderMetadataPayload } from '../../structured_data/keyHolderMetadata'

describe('keyHolderMetadata', () => {
  it('Should generate valid keyHolderMetadataMetadataPayload', () => {
    expect.assertions(3)
    const owner = '0x2424'
    const data = generateKeyHolderMetadataPayload(owner, { publicData: {} })
    expect(data.message.UserMetaData.owner).toEqual(owner)
    expect(data.message.UserMetaData.data.public).toEqual({})

    const data2 = generateKeyHolderMetadataPayload(owner, {
      protectedData: {},
    })

    expect(data2.message.UserMetaData.data.protected).toEqual({})
  })
})

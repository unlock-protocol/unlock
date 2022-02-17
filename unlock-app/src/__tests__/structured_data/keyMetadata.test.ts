import { generateKeyMetadataPayload } from '../../structured_data/keyMetadata'

describe('keyMetadata', () => {
  it('Should generate valid keyMetadataPayload', () => {
    expect.assertions(1)
    const owner = '0x2424'
    const data = generateKeyMetadataPayload(owner, {})
    expect(data.message.KeyMetaData.owner).toEqual(owner)
  })
})

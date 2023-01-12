import generateKeyTypedData from '../../structured_data/keyMetadataTypedData'
import { generateMessage } from '../../structured_data/keyMetadata'

describe('generateKeyTypedData', () => {
  it('Should generate valid KeyMetadataTypedData', () => {
    expect.assertions(2)
    const owner = '0x2424'
    const message = generateMessage(owner, { hello: 'world' })
    const data = generateKeyTypedData(message, 'KeyMetaData')
    expect(data.message.KeyMetaData.owner).toEqual(owner)
    expect(data.message.KeyMetaData.hello).toEqual('world')
  })
})

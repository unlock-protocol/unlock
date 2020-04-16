import { KeyGranter } from '../../src/fulfillment/keyGranter'

describe('KeyGranter', () => {
  const credential =
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
  const host = 'http://localhost:8545'

  const keyGranter = new KeyGranter(credential, host)
  const lockAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
  const recipient = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

  describe('grantKeys', () => {
    describe('when keys can not be granted', () => {
      it('raises an error', async () => {
        expect.assertions(1)
        await expect(
          keyGranter.grantKeys(lockAddress, recipient)
        ).rejects.toThrow('Unable to Grant Keys')
      })
    })

    describe('when keys can be granted', () => {
      /* 
         pulling this for a moment to be completed with use of nock
         holding off until the end 2 end testing  
      */
      // it('returns a transaction hash', async () => {
      //   expect.assertions(1)
      //   await expect(
      //     keyGranter.grantKeys(lockAddress, recipient)
      //   ).resolves.toEqual('hash')
      // })
    })
  })
})

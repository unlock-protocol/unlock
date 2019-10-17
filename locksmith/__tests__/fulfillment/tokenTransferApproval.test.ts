import { BigNumber } from 'ethers/utils'
import TokenTransferApproval from '../../src/fulfillment/tokenTransferApproval'

const nock = require('nock')

nock.back.fixtures = `${__dirname}/fixtures/paymentProcessor`
nock.back.setMode('lockdown')
nock.disableNetConnect()

afterAll(() => {
  nock.restore()
})

describe('TokenTransferApproval', () => {
  let provider = 'http://0.0.0.0:8545'
  let credentials =
    '0xe5986c22698a3c1eb5f84455895ad6826fbdff7b82dbeee240bad0024469d93a'
  let lockContractAddress = '0x5Cd3FC283c42B4d5083dbA4a6bE5ac58fC0f0267'
  let erc20ContractAddress = '0x591ad9066603f5499d12ff4bc207e2f577448c46'

  describe('approve', () => {
    it('returns a transaction hash for the approval request', async () => {
      expect.assertions(1)
      let { nockDone } = await nock.back('approve_token_transfer.json')
      let transferApprover = new TokenTransferApproval(provider, credentials)
      let transaction = await transferApprover.approve(
        '200',
        lockContractAddress,
        erc20ContractAddress
      )
      expect(transaction).toEqual(
        expect.objectContaining({
          chainId: 1984,
          data:
            '0x095ea7b30000000000000000000000005cd3fc283c42b4d5083dba4a6be5ac58fc0f026700000000000000000000000000000000000000000000000000000000000000c8',
          from: '0xC66Ef2E0D0eDCce723b3fdd4307db6c5F0Dda1b8',
          gasLimit: expect.any(BigNumber),
          gasPrice: expect.any(BigNumber),
          hash:
            '0xe136f258cdf5cd640a68cd5893f4a5560c182ff57d7ad8281f6dd51db0325f9a',
          nonce: 24,
          r:
            '0xc5b5959903db291aded64da288568c4ba40772e7c707ead6a4b7e130277faa42',
          s:
            '0x4cccb2f2818aba1245f7336f341b218fe7df5b62a84403fd335354b813e63d07',
          to: '0x591AD9066603f5499d12fF4bC207e2f577448c46',
          v: 4004,
          value: { _hex: '0x00' },
        })
      )

      nockDone()
    })
  })
})

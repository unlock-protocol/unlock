import { keys } from '../../src/utils/ownedKeys'

jest.mock('../../src/utils/deployedLocks', () => {
  return { deployedLocks: jest.fn().mockResolvedValue([]) }
})

let owningAddress = '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'

jest.mock('request-promise-native', () => ({
  default: jest.fn(),
  __esModule: true,
  post: jest.fn().mockResolvedValue(
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      result: {
        address: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        tokenBalances: [
          {
            contractAddress: '0x607f4c5bb672230e8672085532f7e901544a7375',
            tokenBalance:
              '0x00000000000000000000000000000000000000000000000000044d06e87e858e',
            error: null,
          },
          {
            contractAddress: '0x618e75ac90b12c6049ba3b27f5d5f8651b0037f6',
            tokenBalance:
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            error: null,
          },
        ],
      },
    })
  ),
}))

describe('OwnedKeys', () => {
  describe('keys', () => {
    it('returns the addresses of locks associated with keys the address owns', async () => {
      expect.assertions(1)
      expect(await keys(owningAddress)).toEqual([
        '0x607f4c5bb672230e8672085532f7e901544a7375',
      ])
    })
  })
})

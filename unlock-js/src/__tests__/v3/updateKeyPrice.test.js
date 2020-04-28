import { ethers } from 'ethers'
import * as UnlockV3 from '@unlock-protocol/unlock-abi-3'
import utils from '../../utils'
import { ZERO } from '../../constants'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService, prepContract } from '../helpers/walletServiceHelper'
import erc20 from '../../erc20'
import abis from '../../abis'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */)
const UnlockVersion = abis.v3

let walletService
let transaction
let transactionResult
let setupSuccess

jest.mock('../../erc20.js', () => {
  return { getErc20Decimals: jest.fn() }
})
describe('v3', () => {
  describe('updateKeyPrice', () => {
    const lockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
    const keyPrice = '2' // new keyPrice
    const decimals = 8 // Do not test with 18 which is the default...
    const erc20Address = '0x6F7a54D6629b7416E17fc472B4003aE8EF18EF4c'

    async function nockBeforeEach(decimals = 18, erc20Address) {
      nock.cleanAll()
      walletService = await prepWalletService(
        UnlockV3.PublicLock,
        endpoint,
        nock
      )

      const metadata = new ethers.utils.Interface(UnlockV3.PublicLock.abi)
      const contractMethods = metadata.functions
      const resultEncoder = ethers.utils.defaultAbiCoder

      // Mock the call to get erc20Address (only if it has been set!)
      if (erc20Address) {
        nock.ethCallAndYield(
          contractMethods.tokenAddress.encode([]),
          utils.toChecksumAddress(lockAddress),
          resultEncoder.encode(['uint256'], [erc20Address])
        )
      }

      const callMethodData = prepContract({
        contract: UnlockV3.PublicLock,
        functionName: 'updateKeyPrice',
        signature: 'uint256',
        nock,
      })

      const {
        testTransaction,
        testTransactionResult,
        success,
      } = callMethodData(utils.toDecimal(keyPrice, decimals))

      transaction = testTransaction
      transactionResult = testTransactionResult
      setupSuccess = success
    }

    describe('when the decimals are passed', () => {
      it('should invoke _handleMethodCall with the right params', async () => {
        expect.assertions(2)

        await nockBeforeEach(decimals)
        setupSuccess()

        walletService._handleMethodCall = jest.fn(() =>
          Promise.resolve(transaction.hash)
        )
        const mock = walletService._handleMethodCall

        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const encoder = ethers.utils.defaultAbiCoder
        const oldPrice = '1'

        walletService.provider.waitForTransaction = jest.fn(() =>
          Promise.resolve({
            logs: [
              {
                transactionIndex: 1,
                blockNumber: 19759,
                transactionHash:
                  '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                address: lockAddress,
                topics: [
                  EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                  encoder.encode(
                    ['uint256'],
                    [
                      utils.toRpcResultNumber(
                        utils.toDecimal(oldPrice, decimals)
                      ),
                    ]
                  ),
                  encoder.encode(
                    ['uint256'],
                    [
                      utils.toRpcResultNumber(
                        utils.toDecimal(keyPrice, decimals)
                      ),
                    ]
                  ),
                ],
                data: encoder.encode(
                  ['uint256', 'uint256'],
                  [
                    utils.toRpcResultNumber(
                      utils.toDecimal(oldPrice, decimals)
                    ),
                    utils.toRpcResultNumber(
                      utils.toDecimal(keyPrice, decimals)
                    ),
                  ]
                ),
                logIndex: 0,
                blockHash:
                  '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                transactionLogIndex: 0,
              },
            ],
          })
        )

        const newKeyPrice = await walletService.updateKeyPrice({
          lockAddress,
          keyPrice,
          decimals,
        })

        // verify that the promise passed to _handleMethodCall actually resolves
        // to the result the chain returns from a sendTransaction call to updateKeyPrice
        const result = await mock.mock.calls[0][0]
        await result.wait()
        expect(result).toEqual(transactionResult)
        expect(newKeyPrice).toEqual(keyPrice)
        await nock.resolveWhenAllNocksUsed()
      })
    })

    describe('when the decimals are not passed', () => {
      describe('when the erc20Address is passed', () => {
        it('should retrieve the decimals from the contract', async () => {
          expect.assertions(2)

          await nockBeforeEach(decimals)
          setupSuccess()

          walletService._handleMethodCall = jest.fn(() =>
            Promise.resolve(transaction.hash)
          )
          const mock = walletService._handleMethodCall

          // For ERC20 lock, we will retrieve the decimals
          if (erc20Address !== ZERO) {
            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.resolve(decimals)
            })
          }

          const EventInfo = new ethers.utils.Interface(
            UnlockVersion.PublicLock.abi
          )
          const encoder = ethers.utils.defaultAbiCoder
          const oldPrice = '1'

          walletService.provider.waitForTransaction = jest.fn(() =>
            Promise.resolve({
              logs: [
                {
                  transactionIndex: 1,
                  blockNumber: 19759,
                  transactionHash:
                    '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                  address: lockAddress,
                  topics: [
                    EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                    encoder.encode(
                      ['uint256'],
                      [
                        utils.toRpcResultNumber(
                          utils.toDecimal(oldPrice, decimals)
                        ),
                      ]
                    ),
                    encoder.encode(
                      ['uint256'],
                      [
                        utils.toRpcResultNumber(
                          utils.toDecimal(keyPrice, decimals)
                        ),
                      ]
                    ),
                  ],
                  data: encoder.encode(
                    ['uint256', 'uint256'],
                    [
                      utils.toRpcResultNumber(
                        utils.toDecimal(oldPrice, decimals)
                      ),
                      utils.toRpcResultNumber(
                        utils.toDecimal(keyPrice, decimals)
                      ),
                    ]
                  ),
                  logIndex: 0,
                  blockHash:
                    '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                  transactionLogIndex: 0,
                },
              ],
            })
          )

          const newKeyPrice = await walletService.updateKeyPrice({
            lockAddress,
            keyPrice,
            erc20Address,
          })

          expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
            erc20Address,
            walletService.provider
          )
          // verify that the promise passed to _handleMethodCall actually resolves
          // to the result the chain returns from a sendTransaction call to updateKeyPrice
          const result = await mock.mock.calls[0][0]
          await result.wait()
          expect(newKeyPrice).toEqual(keyPrice)
          await nock.resolveWhenAllNocksUsed()
        })
      })

      describe('when the erc20Address is not passed', () => {
        describe('when the lock is an ERC20 lock', () => {
          it('should retrieve the decimals from the contract', async () => {
            expect.assertions(2)

            await nockBeforeEach(decimals, erc20Address)
            setupSuccess()

            walletService._handleMethodCall = jest.fn(() =>
              Promise.resolve(transaction.hash)
            )
            const mock = walletService._handleMethodCall

            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.resolve(decimals)
            })

            const EventInfo = new ethers.utils.Interface(
              UnlockVersion.PublicLock.abi
            )
            const encoder = ethers.utils.defaultAbiCoder
            const oldPrice = '1'

            walletService.provider.waitForTransaction = jest.fn(() =>
              Promise.resolve({
                logs: [
                  {
                    transactionIndex: 1,
                    blockNumber: 19759,
                    transactionHash:
                      '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                    address: lockAddress,
                    topics: [
                      EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                      encoder.encode(
                        ['uint256'],
                        [
                          utils.toRpcResultNumber(
                            utils.toDecimal(oldPrice, decimals)
                          ),
                        ]
                      ),
                      encoder.encode(
                        ['uint256'],
                        [
                          utils.toRpcResultNumber(
                            utils.toDecimal(keyPrice, decimals)
                          ),
                        ]
                      ),
                    ],
                    data: encoder.encode(
                      ['uint256', 'uint256'],
                      [
                        utils.toRpcResultNumber(
                          utils.toDecimal(oldPrice, decimals)
                        ),
                        utils.toRpcResultNumber(
                          utils.toDecimal(keyPrice, decimals)
                        ),
                      ]
                    ),
                    logIndex: 0,
                    blockHash:
                      '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                    transactionLogIndex: 0,
                  },
                ],
              })
            )

            const newKeyPrice = await walletService.updateKeyPrice({
              lockAddress,
              keyPrice,
            })
            expect(erc20.getErc20Decimals).toHaveBeenCalledWith(
              erc20Address,
              walletService.provider
            )
            // verify that the promise passed to _handleMethodCall actually resolves
            // to the result the chain returns from a sendTransaction call to updateKeyPrice
            const result = await mock.mock.calls[0][0]
            await result.wait()
            expect(newKeyPrice).toEqual(keyPrice)

            await nock.resolveWhenAllNocksUsed()
          })
        })

        describe('when the lock is an Ether lock', () => {
          it('should use 18 as decimals', async () => {
            expect.assertions(2)

            await nockBeforeEach(
              18 /* decimals for an ether lock */,
              ZERO /* no erc20 contract */
            )
            setupSuccess()

            walletService._handleMethodCall = jest.fn(() =>
              Promise.resolve(transaction.hash)
            )
            const mock = walletService._handleMethodCall

            erc20.getErc20Decimals = jest.fn(() => {
              return Promise.reject() // This should not be called!
            })
            const EventInfo = new ethers.utils.Interface(
              UnlockVersion.PublicLock.abi
            )
            const encoder = ethers.utils.defaultAbiCoder
            const oldPrice = '1'

            walletService.provider.waitForTransaction = jest.fn(() =>
              Promise.resolve({
                logs: [
                  {
                    transactionIndex: 1,
                    blockNumber: 19759,
                    transactionHash:
                      '0xace0af5853a98aff70ca427f21ad8a1a958cc219099789a3ea6fd5fac30f150c',
                    address: lockAddress,
                    topics: [
                      EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                      encoder.encode(
                        ['uint256'],
                        [utils.toRpcResultNumber(utils.toDecimal(oldPrice, 18))]
                      ),
                      encoder.encode(
                        ['uint256'],
                        [utils.toRpcResultNumber(utils.toDecimal(keyPrice, 18))]
                      ),
                    ],
                    data: encoder.encode(
                      ['uint256', 'uint256'],
                      [
                        utils.toRpcResultNumber(utils.toDecimal(oldPrice, 18)),
                        utils.toRpcResultNumber(utils.toDecimal(keyPrice, 18)),
                      ]
                    ),
                    logIndex: 0,
                    blockHash:
                      '0xcb27b74a5ff04b129b645bbcfde46fe1a221c2d341223df4ad2ca87e9864678a',
                    transactionLogIndex: 0,
                  },
                ],
              })
            )

            const newKeyPrice = await walletService.updateKeyPrice({
              lockAddress,
              keyPrice,
            })

            expect(erc20.getErc20Decimals).not.toHaveBeenCalled()

            // verify that the promise passed to _handleMethodCall actually resolves
            // to the result the chain returns from a sendTransaction call to updateKeyPrice
            const result = await mock.mock.calls[0][0]
            await result.wait()
            expect(newKeyPrice).toEqual(keyPrice)
            await nock.resolveWhenAllNocksUsed()
          })
        })
      })
    })
  })
})

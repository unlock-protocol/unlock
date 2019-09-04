import { ethers } from 'ethers'
import {
  getErc20BalanceForAddress,
  getErc20Decimals,
  approveTransfer,
} from '../erc20'
import NockHelper from './helpers/nockHelper'
import utils from '../utils'
import { MAX_UINT } from '../constants'

const endpoint = 'http://0.0.0.0:8545'
const nock = new NockHelper(endpoint, false /** debug */, false /** record */)

const erc20ContractAddress = '0x591AD9066603f5499d12fF4bC207e2f577448c46'
const lockContractAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
const callerAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const provider = new ethers.providers.JsonRpcProvider(endpoint)

const erc20Contract = new ethers.utils.Interface([
  'function balanceOf(address tokenOwner) public view returns (uint)',
  'function decimals() public view returns (uint)',
])

describe('erc20', () => {
  describe('getErc20Decimals', () => {
    it('should retrieve the number of decimals used on an ERC20 contract', async () => {
      expect.assertions(1)
      nock.netVersionAndYield(0)

      // Ethers is not actually using the ABI it retrieves
      nock.ethGetCodeAndYield(erc20ContractAddress, '0x0')

      // Actual code to get the decimals
      nock.ethCallAndYield(
        erc20Contract.functions.decimals.encode([]),
        erc20ContractAddress,
        ethers.utils.defaultAbiCoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber('10')]
        )
      )

      const decimals = await getErc20Decimals(erc20ContractAddress, provider)

      expect(decimals).toEqual(10)
    })
  })

  describe('getErc20BalanceForAddress', () => {
    it('should return the balance', async () => {
      expect.assertions(1)
      nock.netVersionAndYield(0)

      // Ethers is not actually using the ABI it retrieves
      nock.ethGetCodeAndYield(erc20ContractAddress, '0x0')

      // Actual code to get the balance
      nock.ethCallAndYield(
        erc20Contract.functions.balanceOf.encode([lockContractAddress]),
        erc20ContractAddress,
        ethers.utils.defaultAbiCoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber('1337')]
        )
      )

      const balance = await getErc20BalanceForAddress(
        erc20ContractAddress,
        lockContractAddress,
        provider
      )
      expect(balance).toEqual('1337')
    })
  })

  describe('approveTransfer', () => {
    describe('when the current approved amount is lower than the required amount', () => {
      it('should dispatch the appropriate transaction', async () => {
        expect.assertions(2)

        let gas = '0x73b3'
        let requiredAmount = 2
        const approvalAmountEncoded = ethers.utils.defaultAbiCoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber(MAX_UINT)]
        )
        let transactionHash =
          '0xbb1f660b4a40e1931b1206d15421f364487b494920b2e67152a9ff4c74dcb66d'
        let transactionData = `0x095ea7b3000000000000000000000000${lockContractAddress.substr(
          2
        )}${approvalAmountEncoded.substr(2)}`

        nock.accountsAndYield([callerAddress])
        nock.netVersionAndYield(0)
        nock.ethGetCodeAndYield(erc20ContractAddress, '0x0') // 0x0 would not be the real response, but we do not need anything special for the tests.

        // Here a call is made to get the current approved amount.
        let callData =
          '0xdd62ed3e000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2000000000000000000000000e29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
        nock.ethCallAndYield(
          callData,
          erc20ContractAddress,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          callerAddress
        )

        nock.ethEstimateGas(
          callerAddress,
          erc20ContractAddress,
          transactionData,
          gas
        )

        nock.ethSendTransactionAndYield(
          {
            gas: gas,
            to: erc20ContractAddress,
            data: transactionData,
            from: callerAddress.toLowerCase(),
          },
          null,
          transactionHash
        )

        nock.ethGetTransactionByHash(transactionHash, {
          hash: transactionHash,
          nonce: '0x8',
          blockHash: null,
          blockNumber: null,
          transactionIndex: null,
          from: callerAddress,
          to: erc20ContractAddress,
          value: '0x0',
          gas: gas,
          gasPrice: '0x4a817c800',
          input: transactionData,
          v: '0x1c',
          r:
            '0x4666676244df72f2a2527b30ef7316b7c21e4c70985f968dd6dfeff0f1d0c6b8',
          s:
            '0x237f5b5bde381eedd1c016111ca9549beb7742abb7c9a7af25aad3c53f98f792',
        })

        let result = await approveTransfer(
          erc20ContractAddress,
          lockContractAddress,
          requiredAmount,
          provider
        )
        expect(result).toHaveProperty('hash', transactionHash)
        expect(result).toHaveProperty('data', transactionData)
      })
    })

    describe('when the current approved amount is larger than the required amount', () => {
      it('should not dispatch an approveTransfer transaction', async () => {
        expect.assertions(1)

        let requiredAmount = 2

        nock.accountsAndYield([callerAddress])
        nock.netVersionAndYield(0)
        nock.ethGetCodeAndYield(erc20ContractAddress, '0x0') // 0x0 would not be the real response, but we do not need anything special for the tests.

        // Here a call is made to get the current approved amount.
        let callData =
          '0xdd62ed3e000000000000000000000000aaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2000000000000000000000000e29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
        nock.ethCallAndYield(
          callData,
          erc20ContractAddress,
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callerAddress
        )

        let result = await approveTransfer(
          erc20ContractAddress,
          lockContractAddress,
          requiredAmount,
          provider
        )
        expect(result).toBe(null)
      })
    })
  })
})

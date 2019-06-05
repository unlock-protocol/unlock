import { ethers } from 'ethers'
import { getErc20BalanceForAddress, getErc20Decimals } from '../erc20'
import NockHelper from './helpers/nockHelper'
import utils from '../utils'

const endpoint = 'http://0.0.0.0:8545'
const nock = new NockHelper(endpoint, false /** debug */, false /** record */)

const erc20ContractAddress = '0x591AD9066603f5499d12fF4bC207e2f577448c46'
const lockContractAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

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
})

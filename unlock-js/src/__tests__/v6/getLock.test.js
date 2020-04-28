import v6 from '../../v6'

import Web3Service from '../../web3Service'
import utils from '../../utils'

import erc20 from '../../erc20'

import { getTestLockContract } from '../helpers/contracts'
import { getTestProvider } from '../helpers/provider'
import { ZERO, MAX_UINT } from '../../constants'

const provider = getTestProvider({})

const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const owner = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const erc20ContractAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'

const lockContract = getTestLockContract({
  lockAddress,
  abi: v6.PublicLock.abi,
  provider,
})

let web3Service

jest.mock('../../erc20.js', () => {
  return {
    getErc20TokenSymbol: jest.fn(() => Promise.resolve('TICKER')),
    getErc20BalanceForAddress: jest.fn(() => Promise.resolve(0)),
    getErc20Decimals: jest.fn(() => Promise.resolve(18)), // 18 is the most frequent default for ERC20
  }
})

describe('v6', () => {
  describe('getLock', () => {
    beforeEach(() => {
      web3Service = new Web3Service({
        readOnlyProvider: '',
        network: 1984,
      })

      web3Service.lockContractAbiVersion = jest.fn(() => Promise.resolve(v6))
      web3Service.getLockContract = jest.fn(() => Promise.resolve(lockContract))

      web3Service.getAddressBalance = jest.fn(() =>
        Promise.resolve(utils.fromWei('3735944941', 'ether'))
      )

      web3Service.provider.getBlockNumber = jest.fn(() => Promise.resolve(1337))
      lockContract.functions = {
        'keyPrice()': jest.fn(() => utils.toWei('0.01', 'ether')),
        'expirationDuration()': jest.fn(() => Promise.resolve(2592000)),
        'maxNumberOfKeys()': jest.fn(() => Promise.resolve(10)),
        'beneficiary()': jest.fn(() => Promise.resolve(owner)),
        'name()': jest.fn(() => Promise.resolve('My Lock')),
        'tokenAddress()': jest.fn(() => Promise.resolve(ZERO)),
        'publicLockVersion()': jest.fn(() =>
          Promise.resolve('0x00000000000000000004')
        ),
        'totalSupply()': jest.fn(() => Promise.resolve(17)),
      }
    })

    it('should trigger an event when it has been loaded with an updated balance', async () => {
      expect.assertions(2)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toEqual({
          name: 'My Lock',
          balance: utils.fromWei('3735944941', 'ether'),
          keyPrice: utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          beneficiary: owner,
          outstandingKeys: 17,
          asOf: 1337,
          currencyContractAddress: null,
          publicLockVersion: 4,
        })
      })

      await web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an ERC20 currency, with the right balance', async () => {
      expect.assertions(4)

      lockContract.functions['tokenAddress()'] = jest.fn(
        () => erc20ContractAddress
      )

      const symbol = 'SYMBOL'
      erc20.getErc20TokenSymbol = jest.fn(() => {
        return Promise.resolve(symbol)
      })
      const balance = 1929
      erc20.getErc20BalanceForAddress = jest.fn(() => {
        return Promise.resolve(balance)
      })
      const decimals = 3
      erc20.getErc20Decimals = jest.fn(() => {
        return Promise.resolve(decimals)
      })

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toEqual({
          name: 'My Lock',
          balance: utils.fromDecimal(balance, decimals),
          keyPrice: utils.fromDecimal('10000000000000000', decimals),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          currencySymbol: symbol,
          beneficiary: owner,
          outstandingKeys: 17,
          asOf: 1337,
          currencyContractAddress: erc20ContractAddress,
          publicLockVersion: 4,
        })
      })

      await web3Service.getLock(lockAddress)

      expect(erc20.getErc20BalanceForAddress).toHaveBeenCalledWith(
        erc20ContractAddress,
        lockAddress,
        web3Service.provider
      )
      expect(erc20.getErc20TokenSymbol).toHaveBeenCalledWith(
        erc20ContractAddress,
        web3Service.provider
      )
    })

    it('should successfully yield a lock with an unlimited number of keys', async () => {
      expect.assertions(2)

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          maxNumberOfKeys: -1,
        })
      })

      lockContract.functions['maxNumberOfKeys()'] = jest.fn(() =>
        Promise.resolve(MAX_UINT)
      )

      await web3Service.getLock(lockAddress)
    })
  })
})

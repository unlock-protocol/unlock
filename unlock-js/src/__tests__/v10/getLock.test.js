import * as UnlockV10 from 'unlock-abi-1-0'
import { ethers } from 'ethers'
import Web3Service from '../../web3Service'
import NockHelper from '../helpers/nockHelper'
import utils from '../../utils'
import { ZERO } from '../../constants'

const endpoint = 'http://127.0.0.1:8545'
const nock = new NockHelper(endpoint, false /** debug */, true /** ethers */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let web3Service
const blockTime = 3
const readOnlyProvider = 'http://127.0.0.1:8545'
const requiredConfirmations = 12
const lockAddress = '0xc43efe2c7116cb94d563b5a9d68f260ccc44256f'
const checksumLockAddress = utils.toChecksumAddress(lockAddress)
const owner = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
const erc20ContractAddress = '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'

describe('v10', () => {
  describe('getLock', () => {
    const metadata = new ethers.utils.Interface(UnlockV10.PublicLock.abi)
    const contractMethods = metadata.functions
    const resultEncoder = ethers.utils.defaultAbiCoder
    const fakeContract = new ethers.utils.Interface([
      'publicLockVersion() uint256',
    ])
    async function nockBeforeEach() {
      nock.cleanAll()

      nock.netVersionAndYield(0)
      web3Service = new Web3Service({
        readOnlyProvider,
        unlockAddress,
        blockTime,
        requiredConfirmations,
        useEthers: true,
      })
      await nock.resolveWhenAllNocksUsed()
    }

    function callReadOnlyFunction({
      maxKeys = 10,
      erc20ContractAddress = ZERO,
    }) {
      // check to see what version that is
      nock.ethGetCodeAndYield(
        lockAddress,
        UnlockV10.PublicLock.deployedBytecode
      )
      nock.ethCallAndYield(
        fakeContract.functions['publicLockVersion()'].encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [3])
      )

      // retrieve the bytecode and compare to v01
      nock.ethGetCodeAndYield(
        lockAddress,
        UnlockV10.PublicLock.deployedBytecode
      )

      // get the block number
      nock.ethBlockNumber(1337)

      // retrieve the bytecode and compare to v01
      nock.ethGetCodeAndYield(
        lockAddress,
        UnlockV10.PublicLock.deployedBytecode
      )

      nock.getBalanceForAccountAndYieldBalance(
        lockAddress,
        utils.toRpcResultNumber('0xdeadfeed')
      )

      // call the attributes
      nock.ethCallAndYield(
        contractMethods.keyPrice.encode([]),
        checksumLockAddress,
        resultEncoder.encode(
          ['uint256'],
          [utils.toRpcResultNumber('10000000000000000')]
        )
      )

      nock.ethCallAndYield(
        contractMethods.expirationDuration.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [utils.toRpcResultNumber(2592000)])
      )

      nock.ethCallAndYield(
        contractMethods.maxNumberOfKeys.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [utils.toRpcResultNumber(maxKeys)])
      )

      nock.ethCallAndYield(
        contractMethods.owner.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['address'], [owner])
      )

      nock.ethCallAndYield(
        contractMethods.totalSupply.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [utils.toRpcResultNumber(17)])
      )

      nock.ethCallAndYield(
        contractMethods.tokenAddress.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [erc20ContractAddress])
      )

      nock.ethCallAndYield(
        contractMethods.publicLockVersion.encode([]),
        checksumLockAddress,
        resultEncoder.encode(['uint256'], [utils.toRpcResultNumber(3)])
      )
    }

    it('should trigger an event when it has been loaded with an updated balance', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      callReadOnlyFunction({})

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toEqual({
          balance: utils.fromWei('3735944941', 'ether'),
          keyPrice: utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          owner,
          outstandingKeys: 17,
          asOf: 1337,
          currencyContractAddress: null,
          publicLockVersion: 3,
        })
      })

      await web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an ERC20 currency', async () => {
      expect.assertions(2)
      await nockBeforeEach()
      callReadOnlyFunction({ erc20ContractAddress })

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toEqual({
          balance: utils.fromWei('3735944941', 'ether'),
          keyPrice: utils.fromWei('10000000000000000', 'ether'),
          expirationDuration: 2592000,
          maxNumberOfKeys: 10,
          owner,
          outstandingKeys: 17,
          asOf: 1337,
          currencyContractAddress: erc20ContractAddress,
          publicLockVersion: 3,
        })
      })

      await web3Service.getLock(lockAddress)
    })

    it('should successfully yield a lock with an unlimited number of keys', async () => {
      expect.assertions(3)
      await nockBeforeEach()
      callReadOnlyFunction({
        maxKeys:
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      })

      web3Service.on('lock.updated', (address, update) => {
        expect(address).toBe(lockAddress)
        expect(update).toMatchObject({
          maxNumberOfKeys: -1,
        })
      })

      const lock = await web3Service.getLock(lockAddress)
      expect(lock).toEqual({
        asOf: 1337,
        balance: '0.000000003735944941',
        expirationDuration: 2592000,
        keyPrice: '0.01',
        maxNumberOfKeys: -1,
        outstandingKeys: 17,
        owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        currencyContractAddress: null,
        publicLockVersion: 3,
      })
    })
  })
})

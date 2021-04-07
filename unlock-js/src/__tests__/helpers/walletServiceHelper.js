import * as UnlockV4 from '@unlock-protocol/unlock-abi-4'
import * as UnlockV6 from '@unlock-protocol/unlock-abi-6'
import * as UnlockV7 from '@unlock-protocol/unlock-abi-7'
import * as UnlockV8 from '@unlock-protocol/unlock-abi-8'
import { ethers } from 'ethers'

import { BigNumber } from 'ethers/utils'
import utils from '../../utils'
import { GAS_AMOUNTS } from '../../constants'

import WalletService from '../../walletService'

const checksumContractAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'
const contractAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
/**
 * Function which sets a new wallet service and connects to it
 * @param {*} unlockAddress
 * @param {*} nock
 */
export const prepWalletService = async (
  contract,
  provider,
  nock,
  isUnlock = false // true for Unlock, false for PublicLock
) => {
  nock.cleanAll()
  const walletService = new WalletService()
  const netVersion = 1984

  let unlockVersion
  switch (contract) {
    case UnlockV4.Unlock:
    case UnlockV4.PublicLock:
      unlockVersion =
        '0x0000000000000000000000000000000000000000000000000000000000000004'
      break
    case UnlockV6.Unlock:
    case UnlockV6.PublicLock:
      unlockVersion =
        '0x0000000000000000000000000000000000000000000000000000000000000006'
      break
    case UnlockV7.Unlock:
    case UnlockV7.PublicLock:
      unlockVersion =
        '0x0000000000000000000000000000000000000000000000000000000000000007'
      break
    case UnlockV8.Unlock:
    case UnlockV8.PublicLock:
      unlockVersion =
        '0x0000000000000000000000000000000000000000000000000000000000000008'
      break
    default:
      break
  }

  nock.netVersionAndYield(netVersion)

  await walletService.connect(provider)

  nock.ethGetCodeAndYield(contractAddress, contract.deployedBytecode)
  if (isUnlock) {
    // this is "Contract.unlockVersion()" with params [] (0x4220bd46)
    nock.ethCallAndYield('0x4220bd46', checksumContractAddress, unlockVersion)
    await walletService.getUnlockContract()
  } else {
    // is PublicLock
    // this is "Contract.publicLockVersion()" with params [] (0xd1bbd49c)

    nock.ethCallAndYield('0xd1bbd49c', checksumContractAddress, unlockVersion)
    if (
      unlockVersion ===
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    ) {
      nock.ethGetCodeAndYield(contractAddress, contract.deployedBytecode)
    }
    await walletService.getLockContract(contractAddress)
  }

  await nock.resolveWhenAllNocksUsed()
  return walletService
}

const testAccount = '0x1234567890123456789012345678901234567890'
const transactionHash =
  '0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331a'

export const prepContract = ({
  contract,
  functionName,
  signature = '',
  nock,
  value,
}) => {
  const unlockInterface = new ethers.utils.Interface(contract.abi)

  return (...args) => {
    const encodedValue = value ? utils.toWei(value, 'ether') : 0
    const testParams = {
      gas: utils.hexStripZeros(utils.hexlify(GAS_AMOUNTS[functionName])),
      to: checksumContractAddress,
      data: unlockInterface.functions[`${functionName}(${signature})`].encode(
        args
      ),
      from: testAccount,
      ...(value ? { value: utils.hexlify(encodedValue) } : {}),
    }

    const testTransaction = {
      blockHash: null,
      blockNumber: null,
      transactionIndex: '0x0',
      nonce: 0,
      value: encodedValue,
      gasPrice: testParams.gas,
      hash: transactionHash,
      ...testParams,
    }

    const testTransactionResult = {
      ...testParams,
      blockHash: null,
      blockNumber: null,
      transactionIndex: 0,
      chainId: 0,
      confirmations: 0,
      creates: null,
      networkId: 0,
      nonce: 0,
      value: utils.bigNumberify(encodedValue),
      gasLimit: utils.bigNumberify(testParams.gas),
      gasPrice: expect.any(BigNumber),
      hash: transactionHash,
      wait: expect.any(Function),
    }
    delete testTransactionResult.gas

    return {
      testAccount,
      testParams,
      testTransaction,
      testTransactionResult,
      success: () => {
        successfulTransactionNocks({
          params: testParams,
          transaction: testTransaction,
          contract,
          nock,
        })
      },
    }
  }
}

export const methodNocks = ({ contract, nock }) => {
  nock.accountsAndYield([testAccount])

  nock.ethGetCodeAndYield(contractAddress, contract.deployedBytecode)
}

export const successfulTransactionNocks = ({
  params,
  transaction,
  contract,
  nock,
}) => {
  methodNocks({ contract, nock })
  nock.ethSendTransactionAndYield(params, undefined, transaction.hash)
  nock.ethGetTransactionByHash(transaction.hash, transaction)
}

export const errorTransactionNocks = ({
  params,
  transaction,
  contract,
  nock,
  error,
}) => {
  methodNocks({ contract, nock })
  nock.ethSendTransactionAndYield(params, undefined, transaction.hash, error)
}

export default {
  prepWalletService,
  prepContract,
  methodNocks,
  successfulTransactionNocks,
  errorTransactionNocks,
}

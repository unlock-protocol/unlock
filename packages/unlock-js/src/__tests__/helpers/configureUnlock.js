import hre from 'hardhat'
import * as abis from '@unlock-protocol/contracts'

/**
 * Configures the Unlock contract by setting its params:
 * @param {*} callback
 */
export default async (
  unlockAddress,
  params,
  transactionOptions = {},
  callback
) => {
  const { ethers } = hre
  const unlockVersionContract = await ethers.getContractAt(
    ['function unlockVersion() view returns (uint8)'],
    unlockAddress
  )

  const version = await unlockVersionContract.unlockVersion()
  const { abi } = abis[`UnlockV${version}`]

  const unlock = await ethers.getContractAt(abi, unlockAddress)
  return await getConfigure(`v${version}`)(
    unlock,
    params,
    transactionOptions,
    callback
  )
}

function getConfigure(version) {
  switch (version) {
    case 'v4':
      return configureUnlockV4
    case 'v6':
      return configureUnlockV6
    case 'v7':
      return configureUnlockV7
    case 'v8':
      return configureUnlockV8
    case 'v9':
      return configureUnlockV9
    case 'v10':
      return configureUnlockV9
    case 'v11':
      return configureUnlockV9
    case 'v12':
      return configureUnlockV12
    default:
      return configureUnlockV12
  }
}

/**
 * Configures unlock version v4
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV4(
  unlockContract,
  { publicLockTemplateAddress, globalTokenSymbol, globalBaseTokenURI },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const transaction = await unlockContract.configUnlock(
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI,
    transactionOptions
  )

  if (callback) {
    callback(null, transaction.hash)
  }

  return ethers.provider.waitForTransaction(transaction.hash)
}

/**
 * Configures unlock version v6
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV6(
  unlockContract,
  { publicLockTemplateAddress, globalTokenSymbol, globalBaseTokenURI },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const transaction = await unlockContract.configUnlock(
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI
  )

  if (callback) {
    callback(null, transaction.hash)
  }

  return ethers.provider.waitForTransaction(transaction.hash)
}

/**
 * Configures unlock version v7
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV7(
  unlockContract,
  { publicLockTemplateAddress, globalTokenSymbol, globalBaseTokenURI },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const configTransaction = await unlockContract.configUnlock(
    globalTokenSymbol,
    globalBaseTokenURI
  )
  if (callback) {
    callback(null, configTransaction.hash)
  }
  ethers.provider.waitForTransaction(configTransaction.hash)

  const deployTemplateTransaction = await unlockContract.setLockTemplate(
    publicLockTemplateAddress
  )

  if (callback) {
    callback(null, deployTemplateTransaction.hash)
  }
  return ethers.provider.waitForTransaction(deployTemplateTransaction.hash)
}
/**
 * Configures unlock version v8
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV8(
  unlockContract,
  {
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI,
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
  },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const configTransaction = await unlockContract.configUnlock(
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    globalTokenSymbol,
    globalBaseTokenURI
  )
  if (callback) {
    callback(null, configTransaction.hash)
  }
  ethers.provider.waitForTransaction(configTransaction.hash)

  const deployTemplateTransaction = await unlockContract.setLockTemplate(
    publicLockTemplateAddress
  )

  if (callback) {
    callback(null, deployTemplateTransaction.hash)
  }
  return ethers.provider.waitForTransaction(deployTemplateTransaction.hash)
}

/**
 * Configures unlock version v9
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV9(
  unlockContract,
  {
    publicLockTemplateAddress,
    globalTokenSymbol,
    globalBaseTokenURI,
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    chainId,
  },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const configTransaction = await unlockContract.configUnlock(
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    globalTokenSymbol,
    globalBaseTokenURI,
    chainId
  )
  if (callback) {
    callback(null, configTransaction.hash)
  }
  ethers.provider.waitForTransaction(configTransaction.hash)

  const deployTemplateTransaction = await unlockContract.setLockTemplate(
    publicLockTemplateAddress
  )

  if (callback) {
    callback(null, deployTemplateTransaction.hash)
  }
  return ethers.provider.waitForTransaction(deployTemplateTransaction.hash)
}

/**
 * Configures unlock version v12
 * @param {PropTypes.lock} publicLockTemplateAddress
 * @param {PropTypes.string} globalTokenSymbol
 * @param {PropTypes.string} globalBaseTokenURI
 * @param {function} callback invoked with the transaction hash
 */
async function configureUnlockV12(
  unlockContract,
  {
    publicLockTemplateAddress,
    publicLockVersion,
    globalTokenSymbol,
    globalBaseTokenURI,
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    chainId,
  },
  transactionOptions = {},
  callback
) {
  const { ethers } = hre
  const configTransaction = await unlockContract.configUnlock(
    unlockDiscountToken,
    wrappedEth,
    estimatedGasForPurchase,
    globalTokenSymbol,
    globalBaseTokenURI,
    chainId
  )
  if (callback) {
    callback(null, configTransaction.hash)
  }
  ethers.provider.waitForTransaction(configTransaction.hash)

  const addLockTemplateTransaction = await unlockContract.addLockTemplate(
    publicLockTemplateAddress,
    publicLockVersion
  )
  ethers.provider.waitForTransaction(addLockTemplateTransaction.hash)

  const deployTemplateTransaction = await unlockContract.setLockTemplate(
    publicLockTemplateAddress
  )

  if (callback) {
    callback(null, deployTemplateTransaction.hash)
  }
  return ethers.provider.waitForTransaction(deployTemplateTransaction.hash)
}

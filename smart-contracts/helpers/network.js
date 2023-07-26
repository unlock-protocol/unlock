/* eslint-disable global-require */
const {
  networks: networksConfigs,
} = require('@unlock-protocol/hardhat-helpers')

const { DEPLOYER_PRIVATE_KEY } = process.env

const getNetworkName = (chainId) => {
  const networkName = Object.keys(networksConfigs).find((name) => {
    return networksConfigs[name].chainId === chainId
  })
  if (!networkName) throw new Error(`Network ${chainId} not supported.`)
  return networksConfigs[networkName].name
}
/**
 * You can set DEPLOYER_PRIVATE_KEY in env with a private key of the
 * account that will be used to deploy the contracts.
 *
 * Or you can set an account using a mnemonic phrase.
 * https://hardhat.org/hardhat-network/reference/#config
 * Ether:
 * + An object describing an HD wallet. This is the default. It can have any of the following fields:
 *       - mnemonic: a 12 or 24 word mnemonic phrase as defined by BIP39. Default value: "test test test test test test test test test test test junk"
 *       - initialIndex: The initial index to derive. Default value: 0.
 *       - path: The HD parent of all the derived keys. Default value: "m/44'/60'/0'/0".
 *       - count: The number of accounts to derive. Default value: 20.
 *       - accountsBalance: string with the balance (in wei) assigned to every account derived. Default value: "10000000000000000000000" (10000 ETH).
 * + An array of the initial accounts that the Hardhat Network will create. Each of them must be an object with privateKey and balance fields.
 * @returns
 */
const getAccounts = () => {
  if (process.env.CI === 'true') {
    return {
      mnemonic: 'test test test test test test test test test test test junk',
      initialIndex: 0,
    }
  } else if (DEPLOYER_PRIVATE_KEY) {
    // if DEPLOYER_PRIVATE_KEY is exported then return a single signer
    return [DEPLOYER_PRIVATE_KEY]
  }

  console.error(
    `Missing DEPLOYER_PRIVATE_KEY environment variable. Please set one. In the meantime, we will use default settings`
  )
  return {
    mnemonic: 'test test test test test test test test test test test junk',
    initialIndex: 0,
  }
}

const getHardhatNetwork = () => {
  const networks = {}
  Object.keys(networksConfigs).forEach((name) => {
    networks[name] = {
      ...networksConfigs[name],
      accounts: getAccounts(name),
    }
  })
  return networks
}

module.exports = {
  getNetworkName,
  getHardhatNetwork,
}

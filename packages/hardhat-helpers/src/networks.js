const networks = require('@unlock-protocol/networks')

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
const { DEPLOYER_PRIVATE_KEY } = process.env
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

// When running CI, we connect to the hardhat node container
const testHost = process.env.CI === 'true' ? 'eth-node' : '127.0.0.1'

const hardhatNetworks = {
  localhost: {
    chainId: 31337,
    url: `http://${testHost}:8545`,
    name: 'localhost',
  },
}

Object.keys(networks).forEach((key) => {
  if (['default', 'networks', 'localhost'].indexOf(key) === -1) {
    hardhatNetworks[key] = {
      chainId: networks[key].id,
      name: networks[key].name,
      url: networks[key].provider,
      accounts: getAccounts(networks[key].name),
    }
  }
  // duplicate xdai record as gnosis
  if (key === 'xdai') {
    hardhatNetworks['gnosis'] = {
      chainId: 100,
      name: 'gnosis',
      url: networks[key].provider,
    }
  }
})

export default hardhatNetworks

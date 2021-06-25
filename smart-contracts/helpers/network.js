const fs = require('fs')

const chains = {
  rinkeby: 4,
  ropsten: 3,
  kovan: 42,
  xdai: 100,
  mainnet: 1,
}

const supportedNetworks = Object.keys(chains)

const getNetworkName = (chainId) => {
  if (chainId === 31337) {
    return 'localhost'
  }
  if (chainId === 1337) {
    return 'ganache'
  }
  const networkName = Object.keys(chains).find((k) => chains[k] === chainId)
  if (!networkName) throw new Error(`Network ${chainId} not supported.`)
  return networkName
}

const checkErrors = (networkName) => {
  if (!networkName || networkName === '') {
    throw new Error('an ETH network name is required ')
  }

  if (!supportedNetworks.includes(networkName.toLowerCase())) {
    throw new Error(`ETH network not supported : ${networkName}`)
  }
}

const getProviderUrl = (networkName) => {
  checkErrors(networkName)

  if (networkName) {
    const uri = process.env[`${networkName.toUpperCase()}_PROVIDER_URL`]
    if (uri && uri !== '') {
      return uri
    }
  }

  return null
}

const getMnemonic = (networkName) => {
  if (process.env.CI === 'true') {
    return 'test test test test test test test test test test test junk'
  }

  checkErrors(networkName)

  if (networkName) {
    const mnemonicFile = `./mnemonic.${networkName.toLowerCase()}`

    // get mnemonic from file
    if (fs.existsSync(mnemonicFile)) {
      const mnemonic = fs.readFileSync(mnemonicFile).toString().trim()
      if (mnemonic && mnemonic !== '') {
        return mnemonic
      }
    } else {
      throw new Error(`Missing mnemonic file: ${mnemonicFile}`)
    }
  }
  return null
}

const getAccounts = (networkName) => {
  const mnemonic = getMnemonic(networkName)
  if (!mnemonic || mnemonic === '') {
    return 'test test test test test test test test test test test junk'
  }
  return mnemonic
}


// parse additional networks and accounts
const getHardhatNetwork = (_networks) => {
  const networks = _networks || {}
  supportedNetworks.forEach((net) => {
    try {
      const url = getProviderUrl(net)
      const accounts = getAccounts(net)

      if (accounts && url) {
        networks[net] = {
          url,
          accounts: {
            mnemonic: accounts,
          },
        }
        // eslint-disable-next-line no-console
        console.log(`Added config for ${net}.`)
      }
    } catch (error) {
      // console.error(error.message)
      // console.log(`skipped.`)
    }
  })
  return networks
}

module.exports = {
  supportedNetworks,
  getProviderUrl,
  getAccounts,
  getNetworkName,
  getHardhatNetwork
}

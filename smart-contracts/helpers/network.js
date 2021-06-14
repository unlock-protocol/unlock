const fs = require('fs')

const supportedNetworks = ['rinkeby', 'ropsten', 'kovan', 'xdai', 'mainnet']

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

module.exports = {
  supportedNetworks,
  getProviderUrl,
  getAccounts,
}

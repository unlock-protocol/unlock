// There is no standard way to detect the provider name...
// TODO: remove? this convenience function is unused
export function getCurrentProvider(environment: any) {
  if (
    environment.ethereum &&
    environment.ethereum.constructor.name === 'Object'
  )
    return 'Opera'

  if (environment.web3.currentProvider.isMetaMask) return 'Metamask'

  if (environment.web3.currentProvider.isTrust) return 'Trust'

  if (environment.web3.currentProvider.isToshi) return 'Coinbase Wallet'

  if (environment.web3.currentProvider.isCipher) return 'Cipher'

  if (environment.web3.currentProvider.constructor.name === 'EthereumProvider')
    return 'Mist'

  if (environment.web3.currentProvider.constructor.name === 'Web3FrameProvider')
    return 'Parity'

  if (
    environment.web3.currentProvider.host &&
    environment.web3.currentProvider.host.indexOf('infura') !== -1
  )
    return 'Infura'

  if (
    environment.web3.currentProvider.host &&
    environment.web3.currentProvider.host.indexOf('localhost') !== -1
  )
    return 'localhost'

  return 'UnknownProvider'
}

export function getWeb3Provider(url: string) {
  return url // we will simply return the URL, walletService will construct its own ethers provider!
}

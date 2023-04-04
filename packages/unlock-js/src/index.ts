export { default as Web3Service } from './web3Service'
export { default as WalletService } from './walletService'
export { getCurrentProvider, getWeb3Provider } from './providers'
export const latestUnlock = 'v11' // TODO Are we using this?
export const latestPublicLock = 'v11' // TODO Are we using this? (it is not even up to date)
export {
  LocksmithService,
  LocksmithServiceConfiguration,
} from './locksmithService'
export * from './locksmithService'
export * from './subgraph'
export * from './erc20'
export * from './erc20abi'
export * from './KeyManager'

const Web3Service = require('./lib/web3Service')
const WalletService = require('./lib/walletService')
const {
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
} = require('./lib/accounts')
const { getCurrentProvider, getWeb3Provider } = require('./lib/providers')
const deploy = require('./lib/deploy').default
const { ETHERS_MAX_UINT } = require('./lib/constants')

module.exports = {
  Web3Service: Web3Service.default,
  WalletService: WalletService.default,
  INFINITE_KEYS: ETHERS_MAX_UINT,
  createAccountAndPasswordEncryptKey,
  getAccountFromPrivateKey,
  getCurrentProvider,
  getWeb3Provider,
  deploy,
}

const Web3Service = require('./lib/web3Service')
const WalletService = require('./lib/walletService')
const createAccountAndPasswordEncryptKey = require('./lib/accounts').default
const { getCurrentProvider, getWeb3Provider } = require('./lib/providers')
const deploy = require('./lib/deploy').default

module.exports = {
  Web3Service: Web3Service.default,
  WalletService: WalletService.default,
  createAccountAndPasswordEncryptKey,
  getCurrentProvider,
  getWeb3Provider,
  deploy,
}

const Web3Service = require('./lib/web3Service')
const WalletService = require('./lib/walletService')
const {
  createAccountAndPasswordEncryptKey,
  getAddressFromPrivateKey,
} = require('./lib/accounts')
const { getCurrentProvider, getWeb3Provider } = require('./lib/providers')
const deploy = require('./lib/deploy').default

module.exports = {
  Web3Service: Web3Service.default,
  WalletService: WalletService.default,
  createAccountAndPasswordEncryptKey,
  getAddressFromPrivateKey,
  getCurrentProvider,
  getWeb3Provider,
  deploy,
}

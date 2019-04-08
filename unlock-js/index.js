const Web3Service = require('./lib/web3Service')
const WalletService = require('./lib/walletService')

module.exports = {
  Web3Service: Web3Service.default,
  WalletService: WalletService.default,
}

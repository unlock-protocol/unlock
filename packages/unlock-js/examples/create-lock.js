/* eslint no-console:0 */
const ethers = require('ethers')
const { WalletService } = require('../lib/index')
const networks = require('./networks')

async function run() {
  const provider = new ethers.providers.JsonRpcProvider(
    networks['80001'].provider
  )

  let privateKey =
    '198009b6c5b4f570e2fd2e42a8ee8ebff1a81006e9fcb9245eaXXXXXXXXX'
  const wallet = new ethers.Wallet(privateKey, provider)
  const walletService = new WalletService(networks)
  await walletService.connect(provider, wallet)
  await walletService.createLock(
    {
      maxNumberOfKeys: 100,
      name: 'demoevent',
      expirationDuration: 12121311,
      keyPrice: '0.01', // Key price needs to be a string
    },
    (error, hash) => {
      // This is the hash of the transaction!
      console.log({ hash })
      response.send(hash)
    }
  )
}

run()

/* eslint no-console:0 */
const ethers = require('ethers')
const { WalletService } = require('../lib/index')
const networks = require('./networks')

const provider = new ethers.providers.JsonRpcProvider(networks[4].provider)

// Create a wallet.
// This one should have a little bit of rinkeby eth but please send more if you use it!
const wallet = new ethers.Wallet.fromMnemonic(
  'solid entry walnut extend aisle skirt myth clog need analyst edit bench'
)
// connect
const signer = wallet.connect(provider)

async function run() {
  const walletService = new WalletService(networks)

  // Connect to a provider with a signer
  await walletService.connect(provider, signer)

  // This lock exists on Rinkeby (you can create one from the dashboard if needed)
  const lockAddress = '0xF735257c43dB1723AAE2A46d71E467b1b8a8422A'
  await walletService.purchaseKey(
    {
      lockAddress,
    },
    (error, hash) => {
      // This is the hash of the transaction!
      console.log({ hash })
    }
  )
}

run()

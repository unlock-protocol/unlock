/* eslint no-console:0 */
const { WalletService } = require('../dist')

// Make sure you add this file!
// Locally:
// const winston = 'http://0.0.0.0:8545'
// rinkeby:
// const rinkeby = new HDWalletProvider(
//   'seed phrase',
//   'https://....',
//   1
// )

// eslint-disable-next-line
const provider = require('../provider.js')

// Setup provider
// Create Wallet Service
// Deploy template
// Output address

/**
 * Unlock Contract:
 * mainnet: 0x3d5409cce1d45233de1d4ebdee74b8e004abdd13
 * rinkeby: 0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b
 * winston: 0x559247Ec8A8771E8C97cDd39b96b9255651E39C5
 */
const unlockAddress = '0x559247Ec8A8771E8C97cDd39b96b9255651E39C5'

async function run() {
  const walletService = new WalletService({})
  walletService.setUnlockAddress(unlockAddress)

  // Connects
  await walletService.connect(provider)

  const templateAddress = await walletService.deployTemplate(
    'v9',
    (error, hash) => {
      if (error) {
        console.error('Failed to deploy')
      }
      console.log('Template Transaction:')
      console.log({ hash })
    }
  )

  console.log('Template deployed at:')
  console.log(templateAddress)

  await walletService.initializeTemplate({ templateAddress }, (error, hash) => {
    if (error) {
      console.error('Failed to deploy')
    }
    console.log('Initialization Transaction:')
    console.log({ hash })
  })
  console.log('Template initialized')
  // TODO: send transaction to disableLock?
  // TODO: send transaction to renounceOwnership?
}

run()

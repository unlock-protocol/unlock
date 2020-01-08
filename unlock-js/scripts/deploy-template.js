/* eslint no-console:0 */
const { WalletService } = require('../lib/index')

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
  const walletService = new WalletService({
    unlockAddress,
  })

  // Connects
  await walletService.connect(provider)

  const templateAddress = await walletService.deployTemplate(
    'v12',
    (error, hash) => {
      console.log('Transaction:')
      console.log({ hash })
    }
  )

  console.log(templateAddress)
}

run()

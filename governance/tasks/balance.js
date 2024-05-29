const { task } = require('hardhat/config')

task('accounts', 'Prints the list of accounts', async () => {
  // eslint-disable-next-line no-undef
  const accounts = await ethers.getSigners()

  accounts.forEach((account, i) => {
    // eslint-disable-next-line no-console
    console.log(`[${i}]: ${account.address}`)
  })
})

task('balance', "Prints an account's ETH balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const account = ethers.getAddress(taskArgs.account)
    const balance = await ethers.provider.getBalance(account)
    // eslint-disable-next-line no-console
    console.log(ethers.formatUnits(balance, 'ether'), 'ETH')
  })

task('balance:udt', "Prints an account's UDT balance")
  .addParam('account', "The account's address")
  .addOptionalParam('udt', 'Address of the UDT contract')
  .setAction(async ({ account, udt }) => {
    if (!udt) {
      // eslint-disable-next-line global-require
      ;({ UDT: udt } = require('../test/helpers'))
    }
    // eslint-disable-next-line global-require
    const udtBalance = require('../scripts/getters/udt-balance')
    await udtBalance({ account, udtAddress: udt })
  })

task('balance:votes', "Prints an account's UDT Gov voting power")
  .addParam('account', "The account's address")
  .addOptionalParam('udt', 'Address of the UDT contract')
  .setAction(async ({ account, udt }) => {
    if (!udt) {
      // eslint-disable-next-line global-require
      ;({ UDT: udt } = require('../test/helpers'))
    }
    // eslint-disable-next-line global-require
    const udtVotes = require('../scripts/getters/udt-votes')
    await udtVotes({ account, udtAddress: udt })
  })

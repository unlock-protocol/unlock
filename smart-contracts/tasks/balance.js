const { task } = require('hardhat/config')

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account)
    const balance = await web3.eth.getBalance(account)
    // eslint-disable-next-line no-console
    console.log(web3.utils.fromWei(balance, 'ether'), 'ETH')
  })

const Web3 = require('web3')

export default async function deploy(
  host,
  port,
  unlockVersion = 'unlock-abi-0',
  onNewContractInstance = () => {},
  web3 = new Web3(`http://${host}:${port}`)
) {
  /* eslint-disable-next-line import/no-dynamic-require */
  const Unlock = require(unlockVersion).Unlock
  const unlock = new web3.eth.Contract(Unlock.abi)

  const accounts = await web3.eth.getAccounts()
  const newContractInstance = await unlock
    .deploy({
      data: Unlock.bytecode,
    })
    .send({
      from: accounts[0],
      gas: 4000000,
    })
  onNewContractInstance(newContractInstance)

  // Initialize
  const data = unlock.methods.initialize(accounts[0]).encodeABI()
  return web3.eth.sendTransaction({
    to: newContractInstance.options.address,
    from: accounts[0],
    data,
    gas: 1000000,
  })
}

const Web3 = require('web3')
const gas = require('./constants').GAS_AMOUNTS

export default async function deploy(
  host,
  port,
  Unlock,
  onNewContractInstance = () => {},
  web3Object
) {
  const web3 = web3Object || new Web3(`http://${host}:${port}`)
  const unlock = new web3.eth.Contract(Unlock.abi)

  const accounts = await web3.eth.getAccounts()
  const newContractInstance = await unlock
    .deploy({
      data: Unlock.bytecode,
    })
    .send({
      from: accounts[0],
      gas: gas.deployContract,
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

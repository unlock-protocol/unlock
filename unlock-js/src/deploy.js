const ethers = require('ethers')
const gas = require('./constants').GAS_AMOUNTS

export default async function deploy(
  host,
  port,
  Unlock,
  onNewContractInstance = () => {}
) {
  const provider = new ethers.providers.JsonRpcProvider(
    `http://${host}:${port}`
  )
  // Load the wallet to deploy the contract with
  const wallet = provider.getSigner(0)
  const factory = new ethers.ContractFactory(
    Unlock.abi,
    Unlock.bytecode,
    wallet
  )
  const accounts = await provider.listAccounts()
  const unlockContract = await factory.deploy({ gasLimit: gas.deployContract })
  onNewContractInstance(unlockContract)

  await unlockContract.deployed()

  const writableUnlockContract = unlockContract.connect(wallet)
  // Initialize
  return writableUnlockContract.initialize(accounts[0], {
    gasLimit: 1000000,
  })
}

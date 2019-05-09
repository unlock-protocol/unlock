const ethers = require('ethers')
const v0 = require('unlock-abi-0')
const v01 = require('unlock-abi-0-1')
const v02 = require('unlock-abi-0-2')

const gas = require('./constants').GAS_AMOUNTS

export default async function deploy(
  host,
  port,
  Unlock,
  onNewContractInstance = () => {}
) {
  let Contract
  switch (Unlock) {
    case 'v0':
      Contract = v0.Unlock
      break
    case 'v01':
      Contract = v01.Unlock
      break
    case 'v02':
      Contract = v02.Unlock
      break
    default:
      Contract = Unlock
  }
  const provider = new ethers.providers.JsonRpcProvider(
    `http://${host}:${port}`
  )
  // Load the wallet to deploy the contract with
  const wallet = provider.getSigner(0)
  const factory = new ethers.ContractFactory(
    Contract.abi,
    Contract.bytecode,
    wallet
  )
  const accounts = await provider.listAccounts()
  const unlockContract = await factory.deploy({ gasLimit: gas.deployContract })

  await unlockContract.deployed()

  const writableUnlockContract = unlockContract.connect(wallet)
  // Initialize
  const result = await writableUnlockContract.initialize(accounts[0], {
    gasLimit: 1000000,
  })
  unlockContract.options = { address: unlockContract.address } // compatibility with the web3 way
  onNewContractInstance(unlockContract)
  return result
}

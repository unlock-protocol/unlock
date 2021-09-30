const ethers = require('ethers')
const bytecode = require('./bytecode').default
const abis = require('./abis').default

/*
 * WARNING: THIS IS DEPRECATED.
 * Use WalletService.deployUnlock
 */
export default async function deploy(
  host,
  port,
  Unlock,
  onNewContractInstance = () => {}
) {
  let Contract
  if (typeof Unlock === 'string') {
    const version = Unlock
    if (!abis[version]) {
      throw new Error(`Contract version "${Unlock}" does not seem to exist`)
    }
    Contract = {
      abi: abis[version].Unlock.abi,
      bytecode: bytecode[version].Unlock,
    }
  } else {
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

  const unlockContract = await factory.deploy()

  await unlockContract.deployed()

  const writableUnlockContract = unlockContract.connect(wallet)
  // Initialize
  const result = await writableUnlockContract.initialize(accounts[0])
  unlockContract.options = { address: unlockContract.address } // compatibility with the web3 way
  onNewContractInstance(unlockContract)
  return result
}

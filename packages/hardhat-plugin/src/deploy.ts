import type { providers } from 'ethers'
import type { HardhatRuntimeEnvironment, FactoryOptions } from 'hardhat/types'

export async function deployContract(
  contractName: string,
  constructorArguments: any[],
  { ethers, network }: HardhatRuntimeEnvironment,
  confirmations: number = 5,
  options: FactoryOptions = {},
  deploymentOptions: providers.TransactionRequest = {}
): Promise<string> {
  if (
    deploymentOptions.gasLimit === undefined &&
    typeof network.config.gas === 'number'
  ) {
    deploymentOptions.gasLimit = network.config.gas
  }
  if (options.signer === undefined) {
    if (process.env.WALLET_PRIVATE_KEY === undefined) {
      throw new Error('No wallet or signer defined for deployment.')
    }
    options.signer = new ethers.Wallet(
      process.env.WALLET_PRIVATE_KEY,
      ethers.provider
    )
  }

  const factory = await ethers.getContractFactory(contractName, options)
  const contract = await factory.deploy(...constructorArguments)
  await contract.deployTransaction.wait(confirmations)
  return contract.address
}

import type { Contract, providers, Signer } from 'ethers'
import type { HardhatRuntimeEnvironment, FactoryOptions } from 'hardhat/types'

export async function deployContract(
  contractName: string,
  constructorArguments: any[],
  { ethers }: HardhatRuntimeEnvironment,
  confirmations: number = 5,
  options: FactoryOptions = {}
): Promise<string> {
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

export async function hardhatDeployContract(
  hre: HardhatRuntimeEnvironment,
  signer: Signer,
  contractJSON: any,
  args: any[] = [],
  overrideOptions: providers.TransactionRequest = {}
): Promise<Contract> {
  if (
    overrideOptions.gasLimit === undefined &&
    typeof hre.network.config.gas === 'number'
  ) {
    overrideOptions.gasLimit = hre.network.config.gas
  }

  return deployContract(signer, contractJSON, args, overrideOptions)
}

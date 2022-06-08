import type { providers, Signer, Contract, ContractFactory } from 'ethers'

import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'

import fs from 'fs-extra'
import path from 'path'

import { UnlockHRE } from '../Unlock'
import { getContractAbi, contractExists } from '../utils'

export async function getContractFactory(
  { ethers }: UnlockHRE,
  contractName: string,
  versionNumber: number,
  signer?: Signer
): Promise<ContractFactory> {
  const { bytecode, abi } = getContractAbi(contractName, versionNumber)
  const factory = await ethers.getContractFactory(abi, bytecode, signer)
  return factory
}

export async function deployContract(
  { network }: UnlockHRE,
  factory: ContractFactory,
  constructorArguments: any[],
  confirmations = 5,
  deploymentOptions: providers.TransactionRequest = {}
): Promise<Contract> {
  if (
    deploymentOptions.gasLimit === undefined &&
    typeof network.config.gas === 'number'
  ) {
    deploymentOptions.gasLimit = network.config.gas
  }

  const contract = await factory.deploy(...constructorArguments)
  await contract.deployTransaction.wait(confirmations)
  return contract
}

export async function deployUpgreadableContract(
  { ethers, network, upgrades, run, contractsFolder }: UnlockHRE,
  contractName: string,
  versionNumber: number,
  initializer: string,
  initializerArguments: any[],
  signer?: Signer,
  confirmations = 5,
  deploymentOptions: providers.TransactionRequest = {}
): Promise<Contract> {
  if (
    deploymentOptions.gasLimit === undefined &&
    typeof network.config.gas === 'number'
  ) {
    deploymentOptions.gasLimit = network.config.gas
  }

  // check contract exists
  contractExists(contractName, versionNumber)

  // need to copy .sol for older versions from contracts package
  const contractPath = path.resolve(
    contractsFolder,
    'unlock',
    `${contractName}V${versionNumber}.sol`
  )

  await fs.copy(
    require.resolve(
      `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${versionNumber}.sol`
    ),
    contractPath
  )

  // Make sure that contract artifacts are up-to-date.
  await run(TASK_COMPILE)

  // delete .sol file now that we have artifact
  await fs.remove(contractPath)

  // get factory
  const qualified = `contracts/unlock/${contractName}V${versionNumber}.sol:${contractName}`
  const factory = await ethers.getContractFactory(qualified, signer)

  const contract = await upgrades.deployProxy(factory, initializerArguments, {
    initializer,
  })
  await contract.deployTransaction.wait(confirmations)
  return contract
}

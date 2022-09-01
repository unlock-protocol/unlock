import type { providers, Signer, Contract, ContractFactory } from 'ethers'

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
  { ethers, network }: UnlockHRE,
  contractName: string,
  versionNumber: number,
  initializer = 'initialize',
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

  // deploy implementation
  const { bytecode, abi } = getContractAbi(contractName, versionNumber)
  const Factory = await ethers.getContractFactory(abi, bytecode, signer)
  const impl = await Factory.deploy()
  await impl.deployTransaction.wait(confirmations)

  // encode initializer data
  const fragment = impl.interface.getFunction(initializer)
  const data = impl.interface.encodeFunctionData(fragment, initializerArguments)

  // deploy proxy
  const { bytecode: proxyBytecode, abi: proxyAbi } = await fs.readJSON(
    path.join(__dirname, '..', 'abis', 'ERC1967Proxy.json')
  )
  const ERC1967Proxy = await ethers.getContractFactory(
    proxyAbi,
    proxyBytecode,
    signer
  )
  const proxy = await ERC1967Proxy.deploy(impl.address, data)

  // wait for proxy deployment
  await proxy.deployTransaction.wait(confirmations)

  return await ethers.getContractAt(abi, proxy.address)
}

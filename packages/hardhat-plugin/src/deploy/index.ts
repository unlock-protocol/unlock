import type { Signer, Contract, ContractFactory } from 'ethers'

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

export async function deployUpgreadableContract(
  { ethers }: UnlockHRE,
  contractName: string,
  versionNumber: number,
  initializer = 'initialize',
  initializerArguments: any[],
  signer?: Signer,
  confirmations = 5
): Promise<Contract> {
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

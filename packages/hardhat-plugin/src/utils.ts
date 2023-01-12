import * as contracts from '@unlock-protocol/contracts'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { Signer, Contract, ContractFactory } from 'ethers'

import fs from 'fs-extra'
import path from 'path'

export const contractExists = (contractName: string, versionNumber: number) => {
  // make sure contract exists
  const contractVersion = `${contractName}V${versionNumber}`
  if (!Object.keys(contracts).includes(contractVersion)) {
    throw Error(
      `Contract '${contractVersion}' is not in present in @unlock-protocol/contracts`
    )
  }
}

export const getContractAbi = (contractName: string, versionNumber: number) => {
  contractExists(contractName, versionNumber)
  const contractVersion = `${contractName}V${versionNumber}`
  // get bytecode
  const { bytecode, abi } = contracts[contractVersion as keyof typeof contracts]

  return { bytecode, abi }
}

export async function getContractFactory(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  versionNumber: number,
  signer?: Signer
): Promise<ContractFactory> {
  const { bytecode, abi } = getContractAbi(contractName, versionNumber)
  const factory = await hre.ethers.getContractFactory(abi, bytecode, signer)
  return factory
}

export async function deployUpgreadableContract(
  hre: HardhatRuntimeEnvironment,
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
  const Factory = await hre.ethers.getContractFactory(abi, bytecode, signer)
  const impl = await Factory.deploy()
  await impl.deployTransaction.wait(confirmations)

  // encode initializer data
  const fragment = impl.interface.getFunction(initializer)
  const data = impl.interface.encodeFunctionData(fragment, initializerArguments)

  // deploy proxy
  const { bytecode: proxyBytecode, abi: proxyAbi } = await fs.readJSON(
    path.join(__dirname, 'abis', 'ERC1967Proxy.json')
  )
  const ERC1967Proxy = await hre.ethers.getContractFactory(
    proxyAbi,
    proxyBytecode,
    signer
  )
  const proxy = await ERC1967Proxy.deploy(impl.address, data)

  // wait for proxy deployment
  await proxy.deployTransaction.wait(confirmations)

  return await hre.ethers.getContractAt(abi, proxy.address)
}

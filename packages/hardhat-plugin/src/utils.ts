import { contracts } from '@unlock-protocol/contracts'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import type { Signer, Contract, ContractFactory } from 'ethers'

import {
  bytecode as proxyBytecode,
  abi as proxyAbi,
} from './abis/ERC1967Proxy.json'

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
  await impl.waitForDeployment()

  // encode initializer data
  const fragment = impl.interface.getFunction(initializer)
  const data = impl.interface.encodeFunctionData(
    fragment!,
    initializerArguments
  )

  // deploy proxy
  const ERC1967Proxy = await hre.ethers.getContractFactory(
    proxyAbi,
    proxyBytecode,
    signer
  )
  const proxy = await ERC1967Proxy.deploy(await impl.getAddress(), data)

  // wait for proxy deployment
  await impl.deploymentTransaction()?.wait(confirmations)

  return await hre.ethers.getContractAt(abi, await proxy.getAddress())
}

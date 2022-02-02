/* eslint-disable import/no-cycle */
import type { providers, Signer } from 'ethers'
import * as contracts from '@unlock-protocol/contracts'

import { UnlockHRE } from './Unlock'

export async function deployContract(
  { ethers, network }: UnlockHRE,
  contractName: string,
  versionNumber: number,
  constructorArguments: any[],
  signer?: Signer,
  confirmations: number = 5,
  deploymentOptions: providers.TransactionRequest = {}
): Promise<string> {
  if (
    deploymentOptions.gasLimit === undefined &&
    typeof network.config.gas === 'number'
  ) {
    deploymentOptions.gasLimit = network.config.gas
  }

  // check contract exists
  const contractVersion = `${contractName}V${versionNumber}`
  if (!Object.keys(contracts).includes(contractVersion)) {
    throw Error(
      `Contract '${contractVersion}' is not in present in @unlock-protocol/contracts`
    )
  }

  const { bytecode, abi } = contracts[contractVersion as keyof {}]

  const factory = await ethers.getContractFactory(abi, bytecode, signer)
  const contract = await factory.deploy(...constructorArguments)
  await contract.deployTransaction.wait(confirmations)
  return contract.address
}

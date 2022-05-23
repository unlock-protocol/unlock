import * as contracts from '@unlock-protocol/contracts'

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

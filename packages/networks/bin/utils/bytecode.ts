import { ethers } from 'ethers'

import { contracts } from '@unlock-protocol/contracts'

export const validateBytecode = async ({
  contractAddress,
  providerURL,
  contractName = 'UnlockV13',
  isProxy = true,
}) => {
  const provider = new ethers.JsonRpcProvider(providerURL)
  // find impl address
  if (isProxy) {
    const hex = await provider.getStorage(
      contractAddress,
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    )
    const implAddress = ethers.stripZerosLeft(hex)
    contractAddress = implAddress
  }
  const { bytecode } = contracts[contractName]

  const deployedByteCode = await provider.getCode(contractAddress)
  return deployedByteCode === bytecode
}

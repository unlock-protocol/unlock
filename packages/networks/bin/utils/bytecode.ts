import { ethers } from 'ethers'
import fs from 'fs-extra'
import { contracts } from '@unlock-protocol/contracts'
import { getCreationTx } from './etherscan'

export const validateBytecode = async ({
  contractAddress,
  chainId,
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

  const { abi, deployedBytecode, bytecode } = contracts[contractName]
  const ContractFactory = new ethers.ContractFactory(abi, bytecode)
  const { data: deployTx } = await ContractFactory.getDeployTransaction()
  console.log({ chainId, contractAddress, contractName })
  // get the data used in the creation tx to match the bytecode
  // we can get that tx id using etherscan
  const { bytecode: creationBytecode } = await getCreationTx({
    chainId,
    contractAddress,
  })

  const getCode = await provider.getCode(contractAddress)

  // check that the bytecode match the creation tx bytecode
  await fs.writeFile(`bytecode-${chainId}.txt`, bytecode)
  await fs.writeFile(`creationBytecode-${chainId}.txt`, creationBytecode)
  await fs.writeFile(`deployTx-${chainId}.txt`, deployTx)
  await fs.writeFile(`getCode-${chainId}.txt`, getCode)
  await fs.writeFile(`deployedBytecode-${chainId}.txt`, deployedBytecode)

  return deployTx === creationBytecode
}

import { ethers } from 'ethers'
import fs from 'fs-extra'
import { getContractSourceCode } from './etherscan'

export const validateContractSource = async ({
  contractAddress,
  chainId,
  providerURL,
  contractName = 'Unlock',
  contractVersion = 13,
  isProxy = false,
}) => {
  const provider = new ethers.JsonRpcProvider(providerURL)

  // find impl address if proxy
  if (isProxy) {
    const hex = await provider.getStorage(
      contractAddress,
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    )
    const implAddress = ethers.stripZerosLeft(hex)
    contractAddress = implAddress
  }

  // read .sol files from contracts package
  const fullPath = `@unlock-protocol/contracts/dist/${contractName}/${contractName}V${contractVersion}.sol`
  const localSource = await fs.readFile(require.resolve(fullPath), 'utf8')

  // get source code from block explorer
  const blockExplorerRes = await getContractSourceCode({
    chainId,
    contractAddress,
  })
  const { SourceCode } = blockExplorerRes.result[0]

  // Blockscout returns the contract code while Etherscan returns the contract manifest
  let distSource
  if (typeof SourceCode === 'string') {
    distSource = SourceCode
  } else {
    const { sources } = JSON.parse(
      SourceCode.substring(1, SourceCode.length - 1)
    )
    // use naming pattern identical to the one in govenance folder deployment
    const submittedContractPath = `contracts/past-versions/${contractName}V${contractVersion}.sol`
    ;({ content: distSource } = sources[submittedContractPath])
  }

  return localSource === distSource
}

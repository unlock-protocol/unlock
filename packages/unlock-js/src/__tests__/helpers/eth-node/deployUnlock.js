import { ethers } from 'ethers'
import * as abis from '@unlock-protocol/contracts'
import { getSigners } from './provider'
import fs from 'fs-extra'
import path from 'path'

/**
 * Deploys the unlock contract and initializes it.
 * This will call the callback twice, once for each transaction
 */
export default async (version, transactionOptions = {}, callback) => {
  const signer = await getSigners()
  const versionNumber = parseInt(version.replace('v', ''))

  // deploy implementation
  const { abi, bytecode } = abis[`UnlockV${versionNumber}`]
  const Factory = new ethers.ContractFactory(abi, bytecode, signer)
  const impl = await Factory.deploy()
  if (callback) {
    callback(null, impl.deployTransaction.hash)
  }
  await impl.deployTransaction.wait()

  // encode initializer data
  const fragment = impl.interface.getFunction('initialize')
  const initializerArguments = [signer.address]
  const data = impl.interface.encodeFunctionData(fragment, initializerArguments)

  // deploy proxy
  const { bytecode: proxyBytecode, abi: proxyAbi } = await fs.readJSON(
    path.join(__dirname, 'abis', 'ERC1967Proxy.json')
  )
  const ERC1967Proxy = new ethers.ContractFactory(
    proxyAbi,
    proxyBytecode,
    signer
  )
  const proxy = await ERC1967Proxy.deploy(impl.address, data)

  if (callback) {
    callback(null, proxy.deployTransaction.hash)
  }
  // wait for proxy deployment
  await proxy.deployTransaction.wait()

  return proxy.address
}

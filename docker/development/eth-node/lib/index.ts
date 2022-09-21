/* eslint-disable no-console */
import { ethers } from 'hardhat'
import type { Contract } from 'ethers'
import fs from 'fs-extra'
import path from 'path'

/**
 * A method which deploys an ERC20 contract
 * @param {*} providerUrl
 */
export const deployErc20 = async (): Promise<Contract> => {
  const { abi, bytecode } = await fs.readJSON(
    __dirname + '/TestErc20Token.json'
  )
  const factory = await ethers.getContractFactory(abi, bytecode)
  const erc20Contract = await factory.deploy({ gasLimit: 6000000 })
  await erc20Contract.deployed()

  return erc20Contract
}

export const outputSubgraphNetworkConf = async (
  unlockAddress: string
): Promise<{}> => {
  const networkConf = {
    localhost: {
      Unlock: {
        address: unlockAddress,
      },
    },
  }
  // update subgraph configuration
  await fs.writeJSON(path.join('.', 'networks.json'), networkConf, {
    spaces: 2,
  })
  return networkConf
}

import { ethers } from 'ethers'
import networks from '../src'
import ERC20 from '../utils/erc20.abi.json'

const expectedKeys = Object.keys(networks['1'])

export const validateKeys = (network) => {
  const missingProperties: string[] = []
  expectedKeys.forEach((key) => {
    if (!(key in network)) {
      missingProperties.push(key as string)
    }
  })
  return missingProperties
}

export const validateERC20 = async ({ token, chainId }) => {
  const errors: string[] = []
  const warnings: string[] = []
  const network = networks[chainId]
  // unlock contract
  const provider = new ethers.JsonRpcProvider(network.provider)
  const unlock = new ethers.Contract(
    network.unlockAddress,
    ['function uniswapOracles(address) view returns (address)'],
    provider
  )

  const contract = new ethers.Contract(token.address, ERC20, provider)

  const symbol = await contract.symbol()
  const name = await contract.name()
  const decimals = parseInt(await contract.decimals())
  if (decimals !== token.decimals) {
    errors.push(
      `Decimals mismatch for ${token.address} on ${chainId}. It needs to be "${decimals}"`
    )
  }
  if (name !== token.name) {
    errors.push(
      `Name mismatch for ${token.address} on ${chainId}. It needs to be "${name}"`
    )
  }
  if (symbol !== token.symbol) {
    errors.push(
      `Symbol mismatch for ${token.address} on ${chainId}. It needs to be "${symbol}"`
    )
  }

  // check if oracle is set in Unlock
  if (token.symbol !== 'WETH' && network.uniswapV3) {
    const isSetInUnlock =
      (await unlock.uniswapOracles(token.address)) !== ethers.ZeroAddress

    if (!isSetInUnlock) {
      warnings.push(
        `Oracle for token ${name} (${symbol}) at ${token.address} on ${network.name} (${chainId}) is not set correctly`
      )
    }
  }
  return { errors, warnings }
}

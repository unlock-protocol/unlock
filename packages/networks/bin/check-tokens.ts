import { ethers } from 'ethers'
import networks from '../src'
import ERC20 from '../utils/erc20.abi.json'
import { log } from './logger'
import * as Sentry from '@sentry/node'

const run = async () => {
  const errors: string[] = []
  const warnings: string[] = []
  for (const networkId in networks) {
    const network = networks[networkId]
    const provider = new ethers.JsonRpcProvider(network.provider)
    const unlock = new ethers.Contract(
      network.unlockAddress,
      ['function uniswapOracles(address) view returns (address)'],
      provider
    )

    if (network.tokens) {
      for (const token of network.tokens) {
        const contract = new ethers.Contract(token.address, ERC20, provider)
        try {
          const symbol = await contract.symbol()
          const name = await contract.name()
          const decimals = parseInt(await contract.decimals())
          if (decimals !== token.decimals) {
            errors.push(
              `Decimals mismatch for ${token.address} on ${networkId}. It needs to be "${decimals}"`
            )
          }
          if (name !== token.name) {
            errors.push(
              `Name mismatch for ${token.address} on ${networkId}. It needs to be "${name}"`
            )
          }
          if (symbol !== token.symbol) {
            errors.push(
              `Symbol mismatch for ${token.address} on ${networkId}. It needs to be "${symbol}"`
            )
          }

          // check if oracle is set in Unlock
          if (token.symbol !== 'WETH' && network.uniswapV3) {
            const isSetInUnlock =
              (await unlock.uniswapOracles(token.address)) !==
              ethers.ZeroAddress

            if (!isSetInUnlock) {
              warnings.push(
                `Oracle for token ${name} (${symbol}) at ${token.address} on ${network.name} (${networkId}) is not set correctly`
              )
            }
          }
        } catch (error) {
          Sentry.captureException(error)
          console.error(
            `We could not verify ${token.address} on ${networkId}. ${error}`
          )
        }
      }
    }
  }

  // log it all
  errors.forEach((error) => log(`[Networks/Tokens]: ${error}`, 'error'))
  warnings.forEach((warning) => log(`[Networks/Tokens]: ${warning}`))
}

run()

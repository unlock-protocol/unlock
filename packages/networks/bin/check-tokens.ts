import { ethers } from 'ethers'
import networks from '../src'
import ERC20 from '../utils/erc20.abi.json'
import { log } from './logger'

const run = async () => {
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
            log(
              `Decimals mismatch for ${token.address} on ${networkId}. It needs to be "${decimals}"`,
              'error'
            )
          }
          if (name !== token.name) {
            log(
              `Name mismatch for ${token.address} on ${networkId}. It needs to be "${name}"`,
              'error'
            )
          }
          if (symbol !== token.symbol) {
            log(
              `Symbol mismatch for ${token.address} on ${networkId}. It needs to be "${symbol}"`,
              'error'
            )
          }

          // check if oracle is set in Unlock
          if (token.symbol !== 'WETH' && network.uniswapV3) {
            const isSetInUnlock =
              (await unlock.uniswapOracles(token.address)) !==
              ethers.ZeroAddress

            if (!isSetInUnlock) {
              log(
                `Oracle for token ${name} (${symbol}) at ${token.address} on ${network.name} (${networkId}) is not set correctly`
              )
            }
          }
        } catch (error) {
          log(`We could not verify ${token.address} on ${networkId}. ${error}`)
        }
      }
    }
  }
}

run()

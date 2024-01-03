import { ethers } from 'ethers'
import networks from '../src'
import ERC20 from '../utils/erc20.abi.json'

const run = async () => {
  for (const networkId in networks) {
    const network = networks[networkId]
    const provider = new ethers.JsonRpcProvider(network.provider)
    if (network.tokens) {
      for (const token of network.tokens) {
        const contract = new ethers.Contract(token.address, ERC20, provider)
        try {
          const symbol = await contract.symbol()
          const name = await contract.name()
          const decimals = parseInt(await contract.decimals())

          if (decimals !== token.decimals) {
            console.error(
              `❌ Decimals mismatch for ${token.address} on ${networkId}. It needs to be "${decimals}"`
            )
          }
          if (name !== token.name) {
            console.error(
              `❌ Name mismatch for ${token.address} on ${networkId}. It needs to be "${name}"`
            )
          }
          if (symbol !== token.symbol) {
            console.error(
              `❌ Symbol mismatch for ${token.address} on ${networkId}. It needs to be "${symbol}"`
            )
          }
        } catch (error) {
          console.error(
            `❌ We could not verify ${token.address} on ${networkId}. ${error}`
          )
        }
      }
    }
  }
}

run()

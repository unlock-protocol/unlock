import fetch from 'isomorphic-fetch'
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'

interface GasSettings {
  maxFeePerGas?: ethers.BigNumber
  maxPriorityFeePerGas?: ethers.BigNumber
  gasPrice?: ethers.BigNumber
}

export const getGasSettings = async (network: number): Promise<GasSettings> => {
  // workaround for polygon: get max fees from gas station
  // see https://github.com/ethers-io/ethers.js/issues/2828
  if (network === 137) {
    try {
      const resp = await fetch('https://gasstation-mainnet.matic.network/v2')
      const { data } = await resp.json()

      const maxFeePerGas = ethers.utils
        .parseUnits(`${Math.ceil(data.fast.maxFee)}`, 'gwei')
        .mul(2)

      const maxPriorityFeePerGas = ethers.utils
        .parseUnits(`${Math.ceil(data.fast.maxPriorityFee)}`, 'gwei')
        .mul(2)

      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
      }
    } catch {
      // ignore
    }
  }

  // get fees from network provider
  const provider = new ethers.providers.JsonRpcProvider(
    networks[network].publicProvider
  )

  let feedata
  try {
    feedata = await provider.getFeeData()
  } catch (error) {
    // do nothing
  }

  if (feedata) {
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feedata

    // We double to increase speed of execution
    // We may end up paying *more* but we get mined earlier
    return {
      maxPriorityFeePerGas: maxFeePerGas?.mul(2),
      maxFeePerGas: maxPriorityFeePerGas || undefined,
      gasPrice: gasPrice?.mul(2),
    }
  }

  // fallback to 40 gwei if no feeData
  return {
    maxFeePerGas: ethers.BigNumber.from(40000000000),
    maxPriorityFeePerGas: ethers.BigNumber.from(40000000000),
  }
}

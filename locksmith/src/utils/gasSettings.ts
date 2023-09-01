import fetch from 'isomorphic-fetch'
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'
import logger from '../logger'

interface GasSettings {
  maxFeePerGas?: ethers.BigNumber
  maxPriorityFeePerGas?: ethers.BigNumber
  gasPrice?: ethers.BigNumber
}

/**
 * sets the max fee per gas based on maxPriorityFeePerGas
 * @returns
 */
export const setMaxFeePerGas = ({
  maxPriorityFeePerGas,
  maxFeePerGas,
}: GasSettings): GasSettings => {
  if (
    maxPriorityFeePerGas &&
    maxFeePerGas &&
    maxPriorityFeePerGas.gt(maxFeePerGas)
  ) {
    return {
      maxPriorityFeePerGas,
      maxFeePerGas: maxPriorityFeePerGas,
    }
  }
  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
  }
}

export const getGasSettings = async (network: number): Promise<GasSettings> => {
  // workaround for polygon: get max fees from gas station
  // see https://github.com/ethers-io/ethers.js/issues/2828
  if (network === 137) {
    try {
      const resp = await fetch('https://gasstation.polygon.technology/v2')
      const data = await resp.json()

      const maxFeePerGas = ethers.utils.parseUnits(
        `${Math.ceil(data.fast.maxFee)}`,
        'gwei'
      )

      const maxPriorityFeePerGas = ethers.utils.parseUnits(
        `${Math.ceil(data.fast.maxPriorityFee)}`,
        'gwei'
      )

      return setMaxFeePerGas({
        maxFeePerGas,
        maxPriorityFeePerGas,
      })
    } catch (error) {
      logger.error(`Could not retrieve fee data from ${network}, ${error}`)
    }
  }

  // get fees from network provider
  const provider = new ethers.providers.JsonRpcBatchProvider(
    networks[network]?.provider
  )

  let feedata
  try {
    feedata = await provider.getFeeData()
  } catch (error) {
    logger.error(`Could not retrieve fee data from ${network}, ${error}`)
  }

  if (feedata) {
    const { gasPrice, maxFeePerGas } = feedata

    // We double to increase speed of execution
    // We may end up paying *more* but we get mined earlier
    if (maxFeePerGas) {
      return setMaxFeePerGas({
        maxPriorityFeePerGas: maxFeePerGas?.mul(2),
        maxFeePerGas: maxFeePerGas,
      })
    }
    return {
      gasPrice: gasPrice?.mul(2),
    }
  } else {
    logger.error(`Fee data unavailable from ${network}`)
  }

  // fallback to 40 gwei if no feeData
  return {
    gasPrice: ethers.BigNumber.from(40000000000),
  }
}

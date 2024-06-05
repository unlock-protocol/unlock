import fetch from 'isomorphic-fetch'
import { ethers } from 'ethers'
import networks from '@unlock-protocol/networks'
import logger from '../logger'

interface GasSettings {
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  gasPrice?: bigint
  lastBaseFeePerGas?: bigint
}

/**
 * sets the max fee per gas based on maxPriorityFeePerGas
 * @returns
 */
export const setMaxFeePerGas = ({
  gasPrice,
  maxPriorityFeePerGas,
  lastBaseFeePerGas,
}: GasSettings): GasSettings => {
  // If we have EIP1559 numbers
  if (maxPriorityFeePerGas && lastBaseFeePerGas) {
    // If maxPriorityFeePerGas is MUCH larger than GasPrice, then we just use GasPrice
    let ourMaxPriorityFee
    if (gasPrice && maxPriorityFeePerGas > gasPrice) {
      ourMaxPriorityFee = gasPrice
    } else {
      ourMaxPriorityFee = maxPriorityFeePerGas * BigInt(2)
    }

    // And we assume the base fee _could_ double
    const maxFeePerGas = lastBaseFeePerGas * BigInt(2) + ourMaxPriorityFee
    return {
      maxPriorityFeePerGas: ourMaxPriorityFee,
      maxFeePerGas: maxFeePerGas,
    }
  }
  return {
    gasPrice,
  }
}

export const getGasSettings = async (network: number): Promise<GasSettings> => {
  // workaround for polygon: get max fees from gas station
  // see https://github.com/ethers-io/ethers.js/issues/2828
  if (network === 137) {
    try {
      const resp = await fetch('https://gasstation.polygon.technology/v2')
      const data = await resp.json()

      const maxFeePerGas = ethers.parseUnits(
        `${Math.ceil(data.fast.maxFee)}`,
        'gwei'
      )

      const maxPriorityFeePerGas = ethers.parseUnits(
        `${Math.ceil(data.fast.maxPriorityFee)}`,
        'gwei'
      )

      return {
        maxFeePerGas,
        maxPriorityFeePerGas,
      }
    } catch (error) {
      logger.error(`Could not retrieve fee data from ${network}, ${error}`)
    }
  }

  // get fees from network provider
  const provider = new ethers.JsonRpcProvider(networks[network]?.provider)

  let feedata
  try {
    feedata = await provider.getFeeData()
  } catch (error) {
    logger.error(`Could not retrieve fee data from ${network}, ${error}`)
  }

  if (feedata) {
    // @ts-expect-error
    return setMaxFeePerGas(feedata)
  }

  try {
    const { gasPrice } = await provider.getFeeData()
    if (gasPrice) {
      return {
        gasPrice,
      }
    }
  } catch (error) {
    logger.error(`Could not retrieve gas price from ${network}, ${error}`)
  }

  // fallback to 40 gwei if no feeData
  logger.info(
    `Fee data or gas price unavailable from ${network}. Using default of 40 gwei`
  )

  return {
    gasPrice: BigInt(40000000000),
  }
}

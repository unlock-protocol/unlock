import { ethers, Wallet, Contract } from 'ethers'
import networks from '@unlock-protocol/networks'

import { KeyRenewal } from '../../models'
import GasPrice from '../../utils/gasPrice'
import Dispatcher from '../../fulfillment/dispatcher'
import logger from '../../logger'
import { getDefiLlamaPrice } from '../../operations/pricingOperations'
import { getWeb3Service } from '../../initializers'

// multiply factor to increase precision for gas calculations
const BASE_POINT_ACCURACY = 1000

// Maximum price we're willing to pay to renew keys (1000 => 5ct)
const MAX_RENEWAL_COST_COVERED = 5 * BASE_POINT_ACCURACY

interface RenewKeyParams {
  keyId: string
  lockAddress: string
  network: number
}
interface RenewKeyReturned {
  keyId: string
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface ShouldRenew {
  shouldRenew: boolean
  gasLimit?: bigint
  gasRefund?: string
  error?: string
}

// Calculate price of gas in USD cents
const getGasFee = async (network: number, gasCost: bigint) => {
  const gasPrice = new GasPrice()
  const gasCostUSD = await gasPrice.gasPriceUSD(network, gasCost)
  return gasCostUSD * BASE_POINT_ACCURACY
}

// calculate price of any ERC20 to USD cents
export const getRefundAmountInUSD = async (network: number, amount: string) => {
  const { priceInAmount: priceUSD } = await getDefiLlamaPrice({
    network,
    amount: parseFloat(amount) * BASE_POINT_ACCURACY,
  })

  return priceUSD || 0
}

export const isWorthRenewing = async (
  network: number,
  lockAddress: string,
  keyId: string
): Promise<ShouldRenew> => {
  const web3Service = getWeb3Service()
  const provider = new ethers.JsonRpcProvider(networks[network].provider)

  // locks for which renewals are disabled
  // TODO: move to database
  if (
    [
      '0xa99fBa0E795b7Ac1a38BD5Ec02176aC28BaC9EC8',
      '0x16772aEeB638A45810bCe514F00a666eBe5e25A0',
      '0x5d6df242127B01f5FBDD9Bb23Dcf76139873f8ac',
      '0xc3a9193F80eb5042ED6B77b120D6e48881321c90',
      '0xd59723c30D56fA84DefaBebe85594cee6AEF25CA',
      '0xfc0116392B4464cDb6Ab28acdcdC1e81601F4580',
    ].indexOf(lockAddress) > -1
  ) {
    logger.info(`Renewals disabled for ${lockAddress} on network ${network}.`)

    return {
      shouldRenew: false,
    }
  }

  try {
    const lock = await web3Service.getLockContract(lockAddress, provider)
    let isRenewable = false
    try {
      isRenewable = await lock.isRenewable(keyId, ethers.ZeroAddress)
    } catch (error) {
      logger.info(
        `Key ${keyId} on ${lockAddress} from network ${network} is not renewable: ${error.message}`
      )
    }

    if (!isRenewable) {
      return {
        shouldRenew: false,
      }
    }

    // get gas refund from contract
    const gasRefund = await lock.gasRefundValue()

    // get ERC20 info
    const { currencyContractAddress } = await web3Service.getLock(
      lockAddress,
      network
    )
    const abi = ['function decimals() public view returns (uint decimals)']
    const tokenContract = new Contract(currencyContractAddress, abi, provider)
    const decimals = await tokenContract.decimals()

    // if gas refund is set, we use a a random signer to get estimate to prevent
    // tx to reverts with msg.sender `ERC20: transfer to address zero`
    let gasEstimate
    if (gasRefund !== BigInt(0)) {
      const randomWallet = await Wallet.createRandom(provider)
      gasEstimate = await lock
        .connect(randomWallet)
        .getFunction('renewMembershipFor')
        .estimateGas(keyId, ethers.ZeroAddress)
    } else {
      gasEstimate = await lock
        .getFunction('renewMembershipFor')
        .estimateGas(keyId, ethers.ZeroAddress)
    }

    // estimate gas for the renewMembership function (check if reverts).
    // we bump by 20%, just to cover temporary changes
    const gasLimit = (gasEstimate / BigInt(8)) * BigInt(10)

    // find costs in USD cents
    const costToRenew = await getGasFee(network, gasLimit)

    const costRefunded = await getRefundAmountInUSD(
      network,
      ethers.formatUnits(gasRefund, decimals)
    )

    const shouldRenew =
      costToRenew <= costRefunded || costToRenew < MAX_RENEWAL_COST_COVERED

    return {
      shouldRenew,
      gasLimit,
      gasRefund,
    }
  } catch (error) {
    logger.error(error)
    return {
      shouldRenew: false,
      error: error.message,
    }
  }
}

export async function renewKey({
  keyId,
  lockAddress,
  network,
}: RenewKeyParams): Promise<RenewKeyReturned> {
  try {
    const renewalInfo = {
      network,
      keyId,
      lockAddress,
    }

    const { shouldRenew, gasRefund, error } = await isWorthRenewing(
      network,
      lockAddress,
      keyId
    )

    if (!shouldRenew) {
      if (error) {
        return {
          network,
          keyId,
          lockAddress,
          error,
        }
      }
      return {
        network,
        keyId,
        lockAddress,
        error: `GasRefundValue (${gasRefund}) does not cover gas cost`,
      }
    }

    // send actual tx
    const fulfillmentDispatcher = new Dispatcher()
    const tx = await fulfillmentDispatcher.renewMembershipFor(
      network,
      lockAddress,
      keyId
    )

    // record renewal in db
    const recordedrenewalInfo = {
      ...renewalInfo,
      tx: tx.hash,
    }
    await KeyRenewal.create(recordedrenewalInfo)
    return recordedrenewalInfo
  } catch (error) {
    logger.error(error.message)
    return {
      network,
      keyId,
      lockAddress,
      error: error.message,
    }
  }
}

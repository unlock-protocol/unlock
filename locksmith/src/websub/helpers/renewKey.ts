import { ethers, Wallet, Contract, constants } from 'ethers'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

import { KeyRenewal } from '../../models'
import GasPrice from '../../utils/gasPrice'
import PriceConversion from '../../utils/priceConversion'
import Dispatcher from '../../fulfillment/dispatcher'
import logger from '../../logger'

// multiply factor to increase precision for gas calculations
const BASE_POINT_ACCURACY = 1000

// Maximum price we're willing to pay to renew keys (1000 => 5ct)
const MAX_RENEWAL_COST_COVERED = 5 * BASE_POINT_ACCURACY

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}
interface RenewKeyReturned {
  keyId: number
  lockAddress: string
  network: number
  tx?: string
  error?: string
}

interface ShouldRenew {
  shouldRenew: boolean
  gasLimit?: ethers.BigNumber
  gasRefund?: string
  error?: string
}

// Calculate price of gas in USD cents
const getGasFee = async (network: number, gasCost: number) => {
  const gasPrice = new GasPrice()
  const gasCostUSD = await gasPrice.gasPriceUSD(network, gasCost)
  return gasCostUSD * BASE_POINT_ACCURACY
}

// calculate price of any ERC20 to USD cents
const getERC20AmountInUSD = async (symbol: string, amount: string) => {
  const conversion = new PriceConversion()
  const priceUSD = await conversion.convertToUSD(symbol, parseFloat(amount))
  return priceUSD * BASE_POINT_ACCURACY
}

export const isWorthRenewing = async (
  network: number,
  lockAddress: string,
  keyId: number
): Promise<ShouldRenew> => {
  const web3Service = new Web3Service(networks)
  const provider = new ethers.providers.JsonRpcProvider(
    networks[network].publicProvider
  )

  try {
    const lock = await web3Service.getLockContract(lockAddress, provider)

    // get gas refund from contract
    const gasRefund = await lock.gasRefundValue()

    // get ERC20 info
    const { currencySymbol, currencyContractAddress } =
      await web3Service.getLock(lockAddress, network)
    const abi = ['function decimals() public view returns (uint decimals)']
    const tokenContract = new Contract(currencyContractAddress, abi, provider)
    const decimals = await tokenContract.decimals()

    // if gas refund is set, we use a a random signer to get estimate to prevent
    // tx to reverts with msg.sender `ERC20: transfer to address zero`
    let estimateGas
    if (gasRefund.toNumber() !== 0) {
      const randomWallet = await Wallet.createRandom().connect(provider)
      estimateGas = lock.connect(randomWallet).estimateGas
    } else {
      estimateGas = lock.estimateGas
    }

    // estimate gas for the renewMembership function (check if reverts).
    // we bump by 20%, just to cover temporary changes
    const gasLimit = (
      await estimateGas.renewMembershipFor(keyId, constants.AddressZero)
    )
      .mul(10)
      .div(8)

    // find costs in USD cents
    const costToRenew = await getGasFee(network, gasLimit.toNumber())
    const costRefunded = await getERC20AmountInUSD(
      currencySymbol,
      ethers.utils.formatUnits(gasRefund, decimals)
    )

    const shouldRenew =
      costToRenew <= costRefunded || costToRenew < MAX_RENEWAL_COST_COVERED

    return {
      shouldRenew,
      gasLimit,
      gasRefund: gasRefund.toNumber(),
    }
  } catch (error) {
    return {
      shouldRenew: false,
      error,
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

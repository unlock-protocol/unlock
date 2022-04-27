import { ethers, Wallet, Contract, constants } from 'ethers'
import { networks } from '@unlock-protocol/networks'
import { NetworkConfig } from '@unlock-protocol/types'
import { KeyRenewal } from '../../models'
import { purchaserCredentials } from '../../../config/config'

interface RenewKeyParams {
  keyId: number
  lockAddress: string
  network: number
}

export async function renewKey({
  keyId,
  lockAddress,
  network,
}: RenewKeyParams) {
  // super complicated parsing to make ts happy ;-)
  const [, networkConfig]: [string, NetworkConfig] = Object.entries(
    networks
  ).find(([, n]) => n.id === network) as [string, NetworkConfig]

  // get RPC connection and signer
  const { provider } = networkConfig
  const rpc = new ethers.providers.JsonRpcProvider(provider)
  const signer = new Wallet(purchaserCredentials, rpc)

  // parse lock
  const abi = [
    'function renewMembershipFor(uint256 _tokenId,address _referrer)',
  ]
  const lock = new Contract(lockAddress, abi, signer)

  // make sure reccuring payments are supported
  if ((await lock.publicLockVersion()) < 10) {
    throw new Error(
      `Renewal only supported for lock v10+ | [${network}, ${lockAddress}, ${keyId}]`
    )
  }

  // estimate gas for the renewMembership function.
  let gasLimit
  try {
    gasLimit = await lock.estimateGas.renewMembershipFor(
      keyId,
      constants.AddressZero
    )
  } catch (error) {
    // If the gas estimate fails, we should skip and try the next one.
    throw new Error(
      `Gas estimation failed | [${network}, ${lockAddress}, ${keyId}]`
    )
  }

  // We only renew keys for which we are getting a gas refund whose value cover the gas spent.
  const gasRefund = await lock.gasRefundValue()
  if (gasRefund.gte(gasLimit)) {
    // send actual tx
    const tx = await lock.renewMembershipFor(keyId, constants.AddressZero)
    // record renewal in db
    KeyRenewal.create({
      network,
      lockAddress,
      keyId,
      initiatedBy: signer.address,
      tx: tx.transactionHash,
    })
  } else {
    throw new Error(
      `GasRefundValue (${gasRefund.toString()}) does not cover gas cost  | [${network}, ${lockAddress}, ${keyId}]`
    )
  }
}

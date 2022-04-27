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

  // send tx
  const tx = await lock.renewMembershipFor(keyId, constants.AddressZero)

  // record renewal in db
  KeyRenewal.create({
    network,
    lockAddress,
    keyId,
    initiatedBy: signer.address,
    tx: tx.transactionHash,
  })
}

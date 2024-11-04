import { transaction } from 'frames.js/core'
import {
  checkAllowance,
  getKeyPrice,
  isMember as checkIsMember,
} from '../components/utils'
import { frames } from '../frames'

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.address as `0x${string}`
  const lock = ctx.state.lock!
  const { address: lockAddress, network, tokenAddress } = lock

  const isMember = await checkIsMember(lockAddress, network, userAddress)
  lock.isMember = isMember

  const keyPrice = await getKeyPrice({
    lockAddress,
    network,
    userAddress,
  })
  lock.priceForUser = keyPrice

  if (tokenAddress) {
    const allowance = await checkAllowance(
      lockAddress,
      Number(network),
      userAddress as string,
      tokenAddress!
    )
    if (Number(allowance) >= Number(keyPrice)) {
      lock.erc20Approved = true
    }
  }

  return transaction({
    chainId: `eip155:${network}`,
    method: 'eth_signTypedData_v4',
    params: {
      domain: {},
      types: {
        Message: [{ name: 'Signature request', type: 'string' }],
      },
      primaryType: 'Message',
      message: {
        'Signature request': 'Please sign this message to connect your wallet.',
      },
    },
  })
})

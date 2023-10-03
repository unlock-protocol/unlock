import { Lock } from '~/unlockTypes'
import { ethers } from 'ethers'

interface BoxActionRequest {
  sender: string
  srcChainId: number
  srcToken?: string
  dstChainId: number
  dstToken?: string
  slippage: number
  actionType: any
  actionConfig: any
}

interface BoxActionResponse {
  tx: any
  tokenPayment?: any
  applicationFee?: any
  bridgeFee?: any
  bridgeId?: any
  relayInfo?: any
}

interface getCrossChainRoutesParams {
  sender: string
  lock: Lock
  prices: any[]
  recipients: string[]
  keyManagers: string[]
  referrers: string[]
  purchaseData: string[]
}

const bigintSerializer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'bigint') {
    return value.toString() + 'n'
  }

  return value
}

const bigintDeserializer = (_key: string, value: unknown): unknown => {
  if (typeof value === 'string' && /^-?\\d+n$/.test(value)) {
    return BigInt(value.slice(0, -1))
  }

  return value
}

export const getCrossChainRoutes = async ({
  sender,
  lock,
  prices,
  recipients,
  keyManagers,
  referrers,
  purchaseData,
}: getCrossChainRoutesParams) => {
  console.log('_______________')
  const baseUrl = 'https://box-v1.api.decent.xyz/api/getBoxAction'
  const apiKey = '9f3ef983290e05e38264f4eb65e09754'
  // Build the object to pass to the cross chain router
  // use axios
  // Go!

  const actionRequest: BoxActionRequest = {
    sender,
    srcChainId: 1, // Loop over all the chains?
    srcToken: ethers.constants.AddressZero, // use the native token. Later: check the user balances!
    dstChainId: lock.network,
    dstToken: lock.currencyContractAddress || ethers.constants.AddressZero,
    slippage: 1, // 1%
    actionType: 'nft-prefer-mint',
    actionConfig: {
      contractAddress: lock.address,
      chainId: lock.network,
      signature:
        'function purchase(uint256[] _values,address[] _recipients,address[] _referrers,address[] _keyManagers,bytes[] _data) payable returns (uint256[])', // We need to get this from walletService!
      args: [
        prices.map((price) =>
          ethers.utils.parseUnits(price.amount.toString(), price.decimals)
        ),
        recipients,
        referrers,
        keyManagers,
        purchaseData,
      ],
      cost: {
        isNative: true,
        amount: prices.reduce(
          (acc, current) =>
            acc.add(
              ethers.utils.parseUnits(
                current.amount.toString(),
                current.decimals
              )
            ),
          ethers.BigNumber.from('0')
        ),
      },
    },
  }
  console.log(actionRequest)
  console.log('_______________')
  const query = JSON.stringify(actionRequest, bigintSerializer)

  const url = `${baseUrl}?arguments=${query}`

  const response = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
    },
  })

  console.log(response)
}

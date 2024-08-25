import { Abi, encodeFunctionData } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { PublicLockV14 } from '@unlock-protocol/contracts'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

const checkouturl = 'https://app.unlock-protocol.com/checkout?id=fe4092ae-8cee-4563-963b-5703f077bf60'//frametest2
const abi = PublicLockV14.abi
const chain = 11155111
const lockAddress = '0x6dd71ec4a3d85cbe1f0d026a4e720ff5fcbdf8b2' //frametest2
// '0x9B03Ab44C945114CFDc0A111E07f7A11600252eF'
const value = 2_000_000_000_000_000

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.connectedAddress!
  const network = Number(ctx.state.lock!.network)
  const lockAddress = ctx.state.lock!.address

  async function getKeyPrice() {
    const web3Service = new Web3Service(networks)
    const mydata = '0x'
    let price = await web3Service.purchasePriceFor({
      lockAddress,
      userAddress: userAddress,
      network,
      data: mydata,
      referrer: userAddress,
    })
    price = price.toString()
    return price
  }

  const keyPrice = await getKeyPrice()
  
  console.log('price\n', keyPrice, 'add', lockAddress, network)

  // PARAMS
  // function purchase(
  //   uint256[] calldata _values,
  //   address[] calldata _recipients,
  //   address[] calldata _referrers,
  //   address[] calldata _keyManagers,
  //   bytes[] calldata _data
  // ) external payable returns (uint256[] memory tokenIds);

  const calldata = encodeFunctionData({
    abi,
    functionName: 'purchase',
    args: [[keyPrice], [userAddress], [userAddress], [userAddress], ['0x']],
  })

  return transaction({
    chainId: `eip155:${chain}`,
    method: 'eth_sendTransaction',
    params: {
      abi: abi as Abi,
      to: lockAddress,
      data: calldata,
      value: keyPrice.toString(),
    },
  })
})

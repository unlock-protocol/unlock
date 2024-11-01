import { Web3Service } from '@unlock-protocol/unlock-js'
import { locksmith } from '../../../../src/config/locksmith'
import networks from '@unlock-protocol/networks'
import { config as appConfig } from '~/config/app'

interface GetKeyPriceParams {
  lockAddress: string
  network: number
  userAddress: string
}

export const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    constant: false,
    inputs: [
      {
        name: 'spender',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
]

export async function getConfig(id: string) {
  const { config } = await fetch(
    `${appConfig.locksmithHost}/v2/checkout/${id}`
  ).then((res) => res.json())
  return config
}

export async function getLockDataFromCheckout(id: string) {
  const config = await getConfig(id)
  const locks = config.locks
  const lockAddress = Object.keys(locks)[0]
  const { name, network } = locks[lockAddress]

  const { data } = await locksmith.lockMetadata(network, lockAddress)
  const { image, description } = data

  let defaultImage
  ;(async function setDefaultImage() {
    const isSvg = /\/icon\/?$/.test(image)

    if (isSvg) {
      await fetch(image)
        .then((res) => res.text())
        .then((svgText) => {
          const base64EncodedSVG = btoa(svgText)
          const base64DataUrl = `data:image/svg+xml;base64,${base64EncodedSVG}`

          defaultImage = base64DataUrl
        })
        .catch((error) => {
          console.error('Error fetching or converting svg:', error)
        })
    }
  })()

  const web3Service = new Web3Service(networks)
  const res = await web3Service.getLock(lockAddress, network)
  const price = `${res.keyPrice} ${res.currencySymbol}`

  let tokenAddress
  if (res.currencySymbol !== 'ETH') {
    const tokens = networks[network].tokens
    const matches = tokens!.filter(
      (token) => token.symbol === res.currencySymbol
    )
    tokenAddress = matches.find((token) => token.featured) || matches[0] || null
    tokenAddress = tokenAddress.address
  }

  const redirectUri = config.redirectUri
  const redirectText = config.endingCallToAction

  const lock = {
    name,
    address: lockAddress,
    network,
    image,
    defaultImage,
    description,
    price,
    currencySymbol: res.currencySymbol,
    tokenAddress,
    redirectUri,
    redirectText,
  }

  return lock
}

export async function getKeyPrice({
  lockAddress,
  network,
  userAddress,
}: GetKeyPriceParams) {
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

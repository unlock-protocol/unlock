import { Web3Service } from '@unlock-protocol/unlock-js'
import { locksmith } from '../../../../src/config/locksmith'
import networks from '@unlock-protocol/networks'
import { config as appConfig } from '~/config/app'
import { erc20Abi } from 'viem'
import { ethers } from 'ethers'
import { MAX_UINT } from '~/constants'

interface GetKeyPriceParams {
  lockAddress: string
  network: number
  userAddress: string
}

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
  const tokenAddress = res.currencyContractAddress
  const isRenewable =
    Number(res.publicLockVersion) >= 11 &&
    res.expirationDuration !== MAX_UINT &&
    !!tokenAddress

  const keysAvailable = await web3Service.keysAvailable(lockAddress, network)
  const isSoldOut = Number(keysAvailable) < 1

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
    isSoldOut,
    isRenewable,
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

export async function checkAllowance(
  lockAddress: string,
  network: number,
  userAddress: string,
  tokenAddress: string
) {
  const web3Service = new Web3Service(networks)
  const contract = new ethers.Contract(
    tokenAddress,
    erc20Abi,
    web3Service.providerForNetwork(network)
  )
  const allowance = await contract.allowance(userAddress, lockAddress)
  return allowance
}

export async function isMember(
  lockAddress: string,
  network: number,
  userAddress: string
) {
  const web3Service = new Web3Service(networks)
  const isMember = await web3Service.getHasValidKey(
    lockAddress,
    userAddress,
    network
  )
  return isMember
}

import { ethers } from 'ethers'

export const minifyAddress = (address: string) => {
  const checked = ethers.utils.isAddress(address)
  return checked
    ? `${address.slice(0, 5)}...${address.slice(address.length - 5)}`
    : address
}

export const isAddressOrEns = (address = '') => {
  return (
    address?.toLowerCase()?.includes('.eth') || ethers.utils.isAddress(address)
  )
}

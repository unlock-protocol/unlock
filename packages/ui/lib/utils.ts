import { ethers } from 'ethers'

export const minifyAddress = (address: string) => {
  const checked = ethers.utils.isAddress(address)
  return checked
    ? `${address.slice(0, 5)}...${address.slice(address.length - 5)}`
    : address
}

export const isValidEns = (name: string) => {
  const isValidEns = name.endsWith('.eth')
  return isValidEns
}

export const isValidAddress = (address: string) => {
  const isValidAddress = ethers.utils.isAddress(address)
  return isValidAddress
}
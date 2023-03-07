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

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()

export const getIconName = (name: string) => {
  let id = name.toLowerCase().trim()
  const regex = /^\d/
  if (regex.test(id)) {
    id = `I${id.toLowerCase()}`
  }
  return capitalize(id)
}

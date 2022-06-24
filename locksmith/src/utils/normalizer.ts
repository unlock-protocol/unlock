import { ethers } from 'ethers'

export function emailAddress(input: string): string {
  return input.toLocaleLowerCase()
}

export function ethereumAddress(input: string): string {
  return ethers.utils.getAddress(input)
}

export function toLowerCaseKeys(obj: Record<string, unknown>) {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    acc[key.toLowerCase()] = obj[key]
    return acc
  }, {})
}

export default {
  emailAddress,
  ethereumAddress,
  toLowerCaseKeys,
}

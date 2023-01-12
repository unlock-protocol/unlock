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

export const getValidNumber = (value: string | number): number | undefined => {
  const reg = new RegExp('^[0-9]*$')
  return reg.test(`${value}`) && !isNaN(parseInt(`${value}`))
    ? parseInt(`${value}`)
    : undefined
}

export default {
  emailAddress,
  ethereumAddress,
  toLowerCaseKeys,
  getValidNumber,
}

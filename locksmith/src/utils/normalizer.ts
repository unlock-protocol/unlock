import { ethers } from 'ethers'
import { Request } from 'express'
export function emailAddress(input: string): string {
  return input.toLocaleLowerCase()
}

export function ethereumAddress(input: string): string {
  return ethers.utils.getAddress(input)
}

export const getValidNumber = (value: string | number): number | undefined => {
  const reg = new RegExp('^[0-9]*$')
  return reg.test(`${value}`) && !isNaN(parseInt(`${value}`))
    ? parseInt(`${value}`)
    : undefined
}

export const url = (value: string) => {
  const trimmed = value.toLowerCase().trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export const getRequestURL = (req: Request) => {
  const requestURL = new URL(
    req.originalUrl,
    `${req.protocol}://${req.get('host')}`
  )
  return requestURL
}

export const getURL = (text: string) => {
  try {
    return new URL(text)
  } catch {
    return
  }
}

export const toLowerCaseKeys = (
  obj: Record<string, unknown>
): Record<string, unknown> => {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    const lowerKey = key.toLowerCase()
    if (
      obj[key] !== null &&
      typeof obj[key] === 'object' &&
      !Array.isArray(obj[key])
    ) {
      acc[lowerKey] = toLowerCaseKeys(obj[key] as Record<string, unknown>)
    } else {
      acc[lowerKey] = obj[key]
    }
    return acc
  }, {})
}

export default {
  emailAddress,
  ethereumAddress,
  toLowerCaseKeys,
  getValidNumber,
  url,
  getRequestURL,
}

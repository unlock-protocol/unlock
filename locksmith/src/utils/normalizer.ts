import { ethers } from 'ethers'
import { Request } from 'express'
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

export default {
  emailAddress,
  ethereumAddress,
  toLowerCaseKeys,
  getValidNumber,
  url,
  getRequestURL,
}

import crypto from 'crypto'
import { ColorResolvable } from 'discord.js'

export function chunk<T>(array: T[], size = 5) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

interface CreateSignatureOptions {
  content: string
  secret: string
  algorithm: string
}
export function createSignature({
  secret,
  content,
  algorithm,
}: CreateSignatureOptions) {
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(content)
    .digest('hex')
  return signature
}

export const NETWORK_COLOR: Record<string, ColorResolvable> = {
  '1': '#3c3c3d',
  '10': '#ff001b',
  '100': '#39a7a1',
  '137': '#8146d9',
  '56': '#f8ba33',
}

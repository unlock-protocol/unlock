import { createFrames } from 'frames.js/next'

export type Lock = {
  name: string
  address: string
  network: number
  image: string
  defaultImage?: string
  description: string
  price: string
  priceForUser?: string
  currencySymbol: string
  tokenAddress?: string
  erc20Approved?: boolean
  redirectUri?: string
  redirectText?: string
  isSoldOut: boolean
  isMember?: boolean
}

export type State = {
  lock: Lock | null
}

export const frames = createFrames<State>({
  basePath: '/frames/checkout',
  initialState: {
    lock: null,
  },
})

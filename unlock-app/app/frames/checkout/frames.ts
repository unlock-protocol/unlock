import { createFrames } from 'frames.js/next'

export type Lock = {
  name: string
  address: string
  network: string
  image: string
  description: string
  price: string
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

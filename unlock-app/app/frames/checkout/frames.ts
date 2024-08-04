import { createFrames } from 'frames.js/next'

type Lock = {
  name: string
  address: string
  network: string
  image: string
}

export type State = {
  step: string
  lock: Lock | null
}

export const frames = createFrames<State>({
  basePath: '/',
  initialState: {
    step: 'select',
    lock: null,
  },
})

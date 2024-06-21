import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'

const fetchMock = createFetchMock(vi)

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMock.enableMocks()

// add support for Uint8Array
// per this issue https://github.com/ethers-io/ethers.js/issues/4365

Object.defineProperty(Uint8Array, Symbol.hasInstance, {
  value(potentialInstance) {
    return this === Uint8Array
      ? Object.prototype.toString.call(potentialInstance) ===
          '[object Uint8Array]'
      : Uint8Array[Symbol.hasInstance].call(this, potentialInstance)
  },
})

import * as rtl from 'react-testing-library'
import Web3Utils from 'web3-utils'

import UnlockContract from '../../artifacts/contracts/Unlock.json'
import { NON_DEPLOYED_CONTRACT } from '../../errors'
import { expectError, wrapperMaker } from './helpers'
import useUnlockContract from '../../hooks/useUnlockContract'

describe('useUnlockContract hook', () => {
  let config
  let wrapper

  const unlockAddress = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
  const fakeIt = '0xaaa88be5e8eb88e38e6ff5ce186d764676012b0b'
  const requiredNetworkId = 1984

  beforeEach(() => {
    config = { unlockAddress, requiredNetworkId }
    wrapper = wrapperMaker(config)
  })

  it('retrieves the unlock address from config if present', () => {
    const {
      result: { current: address },
    } = rtl.testHook(() => useUnlockContract(), { wrapper })

    expect(address).toBe(Web3Utils.toChecksumAddress(unlockAddress))
  })
  it('falls back to the default for the network in the contract', () => {
    config.unlockAddress = false
    wrapper = wrapperMaker(config)

    const save = UnlockContract.networks[requiredNetworkId]
    try {
      UnlockContract.networks[requiredNetworkId] = { address: fakeIt }
      const {
        result: { current: address },
      } = rtl.testHook(() => useUnlockContract(), { wrapper })

      expect(address).toBe(
        Web3Utils.toChecksumAddress(
          UnlockContract.networks[requiredNetworkId].address
        )
      )
    } finally {
      UnlockContract.networks[requiredNetworkId] = save
    }
  })
  it('throws NON_DEPLOYED_CONTRACT if the first two conditions fail', () => {
    config.unlockAddress = false
    config.requiredNetworkId = 123456789
    wrapper = wrapperMaker(config)

    expectError(
      () => rtl.testHook(() => useUnlockContract(), { wrapper }),
      NON_DEPLOYED_CONTRACT
    )
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import Postmate from 'postmate'
import {
  useCheckoutCommunication,
  CheckoutEvents,
  waitingMethodCalls,
  resolveMethodCall,
} from '../../hooks/useCheckoutCommunication'

// Mock useWallets (example)
vi.mock('@privy-io/react-auth', () => ({
  useWallets: () => ({
    wallets: [
      {
        getEthersProvider: vi.fn().mockResolvedValue({
          getNetwork: vi.fn().mockResolvedValue({ chainId: 1 }),
        }),
        switchChain: vi.fn(),
      },
    ],
  }),
}))

// Mock iframe utility
vi.mock('~/utils/iframe', () => ({
  isInIframe: () => true,
}))

// We'll use these references to control the Postmate "handshake"
let handshakeResolve!: (value: any) => void
let handshakePromise!: Promise<any>
let emit: ReturnType<typeof vi.fn>

describe('useCheckoutCommunication', () => {
  beforeEach(() => {
    emit = vi.fn()

    // Create a controllable promise for the Postmate handshake:
    handshakePromise = new Promise((resolve) => {
      handshakeResolve = resolve
    })

    // Mock Postmate.Model to return that promise
    vi.spyOn(Postmate, 'Model').mockImplementation(() => {
      return handshakePromise
    })
  })

  it('emits a userInfo event when emitUserInfo is called', async () => {
    const { result } = renderHook(() => useCheckoutCommunication())

    // Resolve handshake immediately for this test
    act(() => {
      handshakeResolve({ emit })
    })

    await waitFor(() => {
      if (!result.current.ready) {
        throw new Error('Emitter is not ready yet.')
      }
    })

    const userInfo = { address: '0xmyaddress' }
    act(() => {
      result.current.emitUserInfo(userInfo)
    })

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.userInfo, userInfo)
  })

  it('emits a closeModal event when emitCloseModal is called', async () => {
    const { result } = renderHook(() => useCheckoutCommunication())

    act(() => {
      handshakeResolve({ emit })
    })

    await waitFor(() => {
      if (!result.current.ready) {
        throw new Error('Emitter is not ready yet.')
      }
    })

    act(() => {
      result.current.emitCloseModal()
    })

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.closeModal, undefined)
  })

  it('emits a transactionInfo event when emitTransactionInfo is called', async () => {
    const { result } = renderHook(() => useCheckoutCommunication())

    act(() => {
      handshakeResolve({ emit })
    })

    await waitFor(() => {
      if (!result.current.ready) {
        throw new Error('Emitter is not ready yet.')
      }
    })

    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }
    act(() => {
      result.current.emitTransactionInfo(transactionInfo)
    })

    expect(emit).toHaveBeenCalledWith(
      CheckoutEvents.transactionInfo,
      transactionInfo
    )
  })

  it('emits a methodCall event when emitMethodCall is called', async () => {
    const { result } = renderHook(() => useCheckoutCommunication())

    act(() => {
      handshakeResolve({ emit })
    })

    await waitFor(() => {
      if (!result.current.ready) {
        throw new Error('Emitter is not ready yet.')
      }
    })

    const methodCall = { method: 'net_version', id: '42', params: [] }
    act(() => {
      result.current.emitMethodCall(methodCall)
    })

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.methodCall, methodCall)
  })

  it('buffers an arbitrary number of events before the emitter is ready', async () => {
    const userInfo = { address: `0xmyaddress-buffer-test-${Date.now()}` }
    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }

    const { result } = renderHook(() => useCheckoutCommunication())

    // Emit events one at a time to ensure proper ordering
    act(() => {
      result.current.emitUserInfo(userInfo)
    })
    act(() => {
      result.current.emitTransactionInfo(transactionInfo)
    })
    act(() => {
      result.current.emitCloseModal()
    })

    // Since emitter isn't ready, no calls yet
    expect(emit).not.toHaveBeenCalled()

    // Now let the handshake complete
    await act(async () => {
      handshakeResolve({ emit })
    })

    // Wait for the hook to become ready
    await waitFor(() => {
      if (!result.current.ready) {
        throw new Error('Emitter is not ready yet.')
      }
    })

    // Confirm the buffer was flushed in the exact order we emitted
    expect(emit).toHaveBeenNthCalledWith(1, CheckoutEvents.userInfo, userInfo)
    expect(emit).toHaveBeenNthCalledWith(
      2,
      CheckoutEvents.transactionInfo,
      transactionInfo
    )
    expect(emit).toHaveBeenNthCalledWith(
      3,
      CheckoutEvents.closeModal,
      undefined
    )
  })
})

//
// Separate describe block for resolveMethodCall etc.
//
describe('useCheckoutCommunication - resolveMethodCall', () => {
  const resultCallback = vi.fn()
  const errorCallback = vi.fn()

  // Reset waitingMethodCalls before each test
  beforeEach(() => {
    Object.keys(waitingMethodCalls).forEach(
      (key) => delete waitingMethodCalls[key]
    )
    waitingMethodCalls[1] = resultCallback
    waitingMethodCalls[2] = errorCallback
  })

  it('maps a successful method result to the appropriate callback', () => {
    expect(Object.keys(waitingMethodCalls).length).toBe(2)

    resolveMethodCall({ id: 1, response: 'response' })

    expect(resultCallback).toHaveBeenCalledWith(undefined, 'response')
    expect(Object.keys(waitingMethodCalls).length).toBe(1)
  })

  it('maps an unsuccessful method result to the appropriate callback', () => {
    expect(Object.keys(waitingMethodCalls).length).toBe(2)

    resolveMethodCall({ id: 2, error: 'fail' })

    expect(errorCallback).toHaveBeenCalledWith('fail', undefined)
    expect(Object.keys(waitingMethodCalls).length).toBe(1)
  })

  it('returns undefined after logging if no callback exists for the id', () => {
    // 31337 is not in waitingMethodCalls
    expect(resolveMethodCall({ id: 31337, response: 'neat' })).toBeUndefined()
  })
})

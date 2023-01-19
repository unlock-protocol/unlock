import Postmate from 'postmate'
import { renderHook, act } from '@testing-library/react-hooks'
import {
  useCheckoutCommunication,
  CheckoutEvents,
  waitingMethodCalls,
  resolveMethodCall,
} from '../../hooks/useCheckoutCommunication'
import { vi } from 'vitest'

let emit = vi.fn()

describe('useCheckoutCommunication', () => {
  beforeEach(() => {
    emit = vi.fn()
    vi.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
  })

  it('emits a userInfo event when emitUserInfo is called', async () => {
    expect.assertions(1)

    const { result, waitFor } = renderHook(() => useCheckoutCommunication())

    await waitFor(() => result.current.ready)

    const userInfo = { address: '0xmyaddress' }
    result.current.emitUserInfo(userInfo)

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.userInfo, userInfo)
  })

  it('emits a closeModal event when emitCloseModal is called', async () => {
    expect.assertions(1)

    const { result, waitFor } = renderHook(() => useCheckoutCommunication())

    await waitFor(() => result.current.ready)

    result.current.emitCloseModal()

    // the `undefined` in this call is an artifact of the buffer
    // implementation, which always calls with a payload even if there
    // isn't one. This has no impact on real code, since only the
    // event name is important in this case.
    expect(emit).toHaveBeenCalledWith(CheckoutEvents.closeModal, undefined)
  })

  it('emits a transactionInfo event when emitTransactionInfo is called', async () => {
    expect.assertions(1)

    const { result, waitFor } = renderHook(() => useCheckoutCommunication())

    await waitFor(() => result.current.ready)

    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }
    result.current.emitTransactionInfo(transactionInfo)

    expect(emit).toHaveBeenCalledWith(
      CheckoutEvents.transactionInfo,
      transactionInfo
    )
  })

  it('emits a methodCall event when emitMethodCall is called', async () => {
    expect.assertions(1)

    const { result, waitFor } = renderHook(() => useCheckoutCommunication())

    await waitFor(() => result.current.ready)

    const methodCall = { method: 'net_version', id: 42, params: [] }
    result.current.emitMethodCall(methodCall)

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.methodCall, methodCall)
  })

  it('buffers an arbitrary number of events before the emitter is ready', async () => {
    expect.assertions(4)

    const { result, waitFor } = renderHook(() => useCheckoutCommunication())

    const userInfo = { address: '0xmyaddress' }
    act(() => result.current.emitUserInfo(userInfo))

    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }
    act(() => result.current.emitTransactionInfo(transactionInfo))

    act(() => result.current.emitCloseModal())

    // events have gone into the buffer, but have not been emitted
    expect(emit).not.toHaveBeenCalled()

    await waitFor(() => result.current.ready)

    // Once the emitter is ready, the buffer is flushed in the order events were received
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

describe('useCheckoutCommunication - resolveMethodCall', () => {
  const resultCallback = vi.fn()
  const errorCallback = vi.fn()
  waitingMethodCalls[1] = resultCallback
  waitingMethodCalls[2] = errorCallback

  it('maps a successful method result to the appropriate callback', () => {
    expect.assertions(3)

    expect(Object.keys(waitingMethodCalls).length).toEqual(2)

    resolveMethodCall({ id: 1, response: 'response' })

    expect(resultCallback).toHaveBeenCalledWith(undefined, 'response')
    expect(Object.keys(waitingMethodCalls).length).toEqual(1)
  })

  it('maps an unsuccessful method result to the appropriate callback', () => {
    expect.assertions(3)

    expect(Object.keys(waitingMethodCalls).length).toEqual(1)

    resolveMethodCall({ id: 2, error: 'fail' })

    expect(errorCallback).toHaveBeenCalledWith('fail', undefined)
    expect(Object.keys(waitingMethodCalls).length).toEqual(0)
  })

  it('returns after logging if a callback does not exist', () => {
    expect.assertions(1)

    expect(resolveMethodCall({ id: 31337, response: 'neat' })).toBeUndefined()
  })
})

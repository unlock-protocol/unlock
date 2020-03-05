import Postmate from 'postmate'
import { renderHook } from '@testing-library/react-hooks'
import {
  useCheckoutCommunication,
  CheckoutEvents,
} from '../../hooks/useCheckoutCommunication'

let emit = jest.fn()

describe('useCheckoutCommunication', () => {
  beforeEach(() => {
    emit = jest.fn()
    jest.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
  })

  it('emits a userInfo event when emitUserInfo is called', async () => {
    expect.assertions(1)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    const userInfo = { address: '0xmyaddress' }
    result.current.emitUserInfo(userInfo)

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.userInfo, userInfo)
  })

  it('emits a closeModal event when emitCloseModal is called', async () => {
    expect.assertions(1)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    result.current.emitCloseModal()

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.closeModal)
  })

  it('emits a transactionInfo event when emitTransactionInfo is called', async () => {
    expect.assertions(1)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    const transactionInfo = { hash: '0xmyhash' }
    result.current.emitTransactionInfo(transactionInfo)

    expect(emit).toHaveBeenCalledWith(
      CheckoutEvents.transactionInfo,
      transactionInfo
    )
  })
})

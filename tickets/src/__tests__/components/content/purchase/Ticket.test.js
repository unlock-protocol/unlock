import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { Ticket } from '../../../../components/content/purchase/Ticket'
import { KeyStatus } from '../../../../selectors/keys'
import createUnlockStore from '../../../../createUnlockStore'
import { sendConfirmation } from '../../../../actions/email'
import configure from '../../../../config'
import { ConfigContext } from '../../../../utils/withConfig'

jest.mock()
const config = configure({})
const ConfigProvider = ConfigContext.Provider

const account = {
  address: ' 0x123',
}
const lock = {
  address: '0xabc',
}
const signAddress = jest.fn()
const event = {
  date: new Date('2019-06-02'),
  name: 'The Party',
}
const signedLockAddress = 'signedLockAddress'
const keyStatus = KeyStatus.VALID

// Fake QRcode because we cannot render canvas in tests...
jest.mock('../../../../components/content/purchase/TicketCode.js')

jest.mock('../../../../actions/email.js', () => {
  return {
    sendConfirmation: jest.fn(),
  }
})

describe('Ticket', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should dispatch an action to send email when the user enters their address', () => {
    expect.assertions(1)

    const store = createUnlockStore({
      locks: {
        [lock.address]: lock,
      },
      account,
      event,
      tickets: {
        [lock.address]: signedLockAddress,
      },
    })
    const dataUri = 'dataUri'
    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <Ticket
            getDataUriFromCanvas={jest.fn(() => dataUri)}
            account={account}
            lock={lock}
            event={event}
            signAddress={signAddress}
            sendConfirmation={sendConfirmation}
            keyStatus={keyStatus}
          />
        </ConfigProvider>
      </Provider>
    )
    const input = wrapper.getByPlaceholderText('Enter your email address')
    const email = 'hello@unlock-protocol.com'
    rtl.fireEvent.change(input, {
      target: { value: email },
    })
    let sendButton = wrapper.getByText('Send')

    rtl.fireEvent.click(sendButton)
    expect(sendConfirmation).toHaveBeenCalledWith(
      email,
      dataUri,
      event.name,
      event.date.toDateString(),
      window.location.toString()
    )
  })

  it('should not dispatch an action to send email when the user has not entered their email address', () => {
    expect.assertions(1)

    const store = createUnlockStore({
      locks: {
        [lock.address]: lock,
      },
      account,
      event,
      tickets: {
        [lock.address]: signedLockAddress,
      },
    })
    const dataUri = 'dataUri'
    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <Ticket
            getDataUriFromCanvas={jest.fn(() => dataUri)}
            account={account}
            lock={lock}
            event={event}
            signAddress={signAddress}
            sendConfirmation={sendConfirmation}
            keyStatus={keyStatus}
          />
        </ConfigProvider>
      </Provider>
    )
    const input = wrapper.getByPlaceholderText('Enter your email address')
    const email = ''
    rtl.fireEvent.change(input, {
      target: { value: email },
    })
    let sendButton = wrapper.getByText('Send')

    rtl.fireEvent.click(sendButton)
    expect(sendConfirmation).not.toHaveBeenCalled()
  })

  it('should not dispatch an action to send email if the user clicks again on the button', () => {
    expect.assertions(2)

    const store = createUnlockStore({
      locks: {
        [lock.address]: lock,
      },
      account,
      event,
      tickets: {
        [lock.address]: signedLockAddress,
      },
    })
    const dataUri = 'dataUri'
    const wrapper = rtl.render(
      <Provider store={store}>
        <ConfigProvider value={config}>
          <Ticket
            getDataUriFromCanvas={jest.fn(() => dataUri)}
            account={account}
            lock={lock}
            event={event}
            signAddress={signAddress}
            sendConfirmation={sendConfirmation}
            keyStatus={keyStatus}
          />
        </ConfigProvider>
      </Provider>
    )
    const input = wrapper.getByPlaceholderText('Enter your email address')
    const email = 'julien@unlock-protoco.com'
    rtl.fireEvent.change(input, {
      target: { value: email },
    })
    let sendButton = wrapper.getByText('Send')

    rtl.fireEvent.click(sendButton)
    expect(sendConfirmation).toHaveBeenCalledTimes(1)
    rtl.fireEvent.click(sendButton)
    expect(sendConfirmation).toHaveBeenCalledTimes(1)
  })
})

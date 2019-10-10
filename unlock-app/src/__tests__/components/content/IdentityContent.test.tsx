import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import { ConfigContext } from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'
import {
  IdentityContent,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../components/content/IdentityContent'
import { signData } from '../../../actions/signature'

const store = createUnlockStore()

describe('IdentityContent', () => {
  it('should prompt for login if there is no account address', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent signature={null} signData={signData} />
        </ConfigContext.Provider>
      </Provider>
    )

    getByText('Log In to Your Account')
  })

  it('should not show a button to sign some data when there is no account address', () => {
    expect.assertions(1)

    const { queryByText } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent signature={null} signData={signData} />
        </ConfigContext.Provider>
      </Provider>
    )

    expect(queryByText('Click here to sign')).toBeNull()
  })

  it('should not show a QR code unless there is a signature', () => {
    expect.assertions(1)

    const { queryByTestId } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent
            accountAddress="0x123abc"
            signature={null}
            signData={signData}
          />
        </ConfigContext.Provider>
      </Provider>
    )

    expect(queryByTestId('identity-signature-QR-code')).toBeNull()
  })

  it('should show a button to sign some data when there is an account address', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent
            accountAddress="0x123abc"
            signature={null}
            signData={signData}
          />
        </ConfigContext.Provider>
      </Provider>
    )

    getByText('Click here to sign')
  })

  it('should request a signature when the button is clicked', () => {
    expect.assertions(1)

    const signData = jest.fn()
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 1530518207007)
    global.Date.now = dateNowStub

    const { getByText } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent
            accountAddress="0x123abc"
            signature={null}
            signData={signData}
          />
        </ConfigContext.Provider>
      </Provider>
    )

    const button = getByText('Click here to sign')
    rtl.fireEvent.click(button)
    expect(signData).toHaveBeenCalledWith(
      JSON.stringify({
        accountAddress: '0x123abc',
        currentTime: 1530518207007,
      })
    )

    global.Date.now = realDateNow
  })

  it('should show a qr code when there is a signature', () => {
    expect.assertions(0)

    const signature = {
      data: 'my data',
      signature: 'my signature',
    }

    const { getByTestId } = rtl.render(
      <Provider store={store}>
        <ConfigContext.Provider value={{}}>
          <IdentityContent
            accountAddress="0x123abc"
            signature={signature}
            signData={signData}
          />
        </ConfigContext.Provider>
      </Provider>
    )

    getByTestId('identity-signature-QR-code')
  })
})

describe('IdentityContent -- mapDispatchToProps', () => {
  it('should contain a signData function', () => {
    expect.assertions(1)
    const dispatch = jest.fn()
    const dProps = mapDispatchToProps(dispatch)

    dProps.signData('this is my data')

    expect(dispatch).toHaveBeenCalledWith({
      type: 'signature/SIGN_DATA',
      data: 'this is my data',
    })
  })
})

describe('IdentityContent -- mapStateToProps', () => {
  it('should pass through an account address, if available', () => {
    expect.assertions(1)
    const props = mapStateToProps({
      account: {
        address: '0x123abc',
      },
      signature: null,
    })

    expect(props.accountAddress).toEqual('0x123abc')
  })

  it('should pass through a signature, if available', () => {
    expect.assertions(1)

    const signature = {
      data: 'my data',
      signature: 'my signature',
    }
    const props = mapStateToProps({
      signature,
    })

    expect(props.signature).toEqual(signature)
  })
})

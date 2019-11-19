import React from 'react'
import * as rtl from '@testing-library/react'
import { Key, Props } from '../../../../components/interface/keychain/Key'
import { OwnedKey } from '../../../../components/interface/keychain/KeychainTypes'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  tokenURI:
    'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',
  lock: {
    address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0xbadc0ffee',
    price: '50',
  },
}

const aKeyWithNoName: OwnedKey = {
  ...aKey,
  lock: {
    ...aKey.lock,
    name: '',
  },
}

let signData: jest.Mock<any, any>
let qrEmail: jest.Mock<any, any>
interface RenderProps {
  signature?: Props['signature']
  ownedKey?: OwnedKey
}
const render = ({ signature, ownedKey }: RenderProps) => {
  signData = jest.fn()
  qrEmail = jest.fn()
  return rtl.render(
    <Key
      signData={signData}
      qrEmail={qrEmail}
      signature={signature || null}
      accountAddress={accountAddress}
      ownedKey={ownedKey || aKey}
    />
  )
}

describe('keychain -- Key', () => {
  beforeAll(() => {
    ;(global as any).window = {
      location: {
        origin: 'http://localhost',
      },
    }
  })

  afterAll(() => {
    delete (global as any).window
  })

  it('should render the lock name', () => {
    expect.assertions(0)
    const { getByText } = render({})

    getByText(aKey.lock.name)
  })

  it('should dispatch a payload to be signed', () => {
    expect.assertions(1)
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 1530518207007)
    global.Date.now = dateNowStub
    const { getByText } = render({})

    const button = getByText('Assert Ownership')
    rtl.fireEvent.click(button)

    expect(signData).toHaveBeenCalledWith(
      JSON.stringify({
        accountAddress,
        lockAddress: aKey.lock.address,
        timestamp: dateNowStub(),
      }),
      aKey.lock.address
    )

    global.Date.now = realDateNow
  })

  it('should display a QR code immediately after a signature is received', () => {
    expect.assertions(2)

    const { container, rerender } = rtl.render(
      <Key
        signData={signData}
        qrEmail={qrEmail}
        signature={null}
        accountAddress={accountAddress}
        ownedKey={aKey}
      />
    )

    expect(container.querySelector('canvas')).toBeNull()

    rerender(
      <Key
        signData={signData}
        qrEmail={qrEmail}
        signature={{
          data: 'some data',
          signature: 'a signature',
        }}
        accountAddress={accountAddress}
        ownedKey={aKey}
      />
    )

    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should display a qr code on button click when there is a signature', () => {
    expect.assertions(2)

    const { getByText, container } = render({
      signature: {
        data: 'some data',
        signature: 'a signature',
      },
    })

    expect(container.querySelector('canvas')).toBeNull()

    const button = getByText('Display QR Code')
    rtl.fireEvent.click(button)

    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should send an email when the send button is clicked', () => {
    expect.assertions(1)

    const { getByText, getByPlaceholderText } = render({
      signature: {
        data: 'some data',
        signature: 'a signature',
      },
    })

    const qrButton = getByText('Display QR Code')
    rtl.fireEvent.click(qrButton)

    const emailInput = getByPlaceholderText('Email address')
    rtl.fireEvent.change(emailInput, {
      target: { value: 'ronald@mcdonalds.gov' },
    })

    const emailSubmit = getByText('Send Email')
    rtl.fireEvent.click(emailSubmit)

    expect(qrEmail).toHaveBeenCalledWith(
      'ronald@mcdonalds.gov',
      'ERC20 paywall lock',
      'data:image/png;base64,00'
    )
  })

  it('should send an email when the send button is clicked (unnamed lock)', () => {
    expect.assertions(1)

    const { getByText, getByPlaceholderText } = render({
      signature: {
        data: 'some data',
        signature: 'a signature',
      },
      ownedKey: aKeyWithNoName,
    })

    const qrButton = getByText('Display QR Code')
    rtl.fireEvent.click(qrButton)

    const emailInput = getByPlaceholderText('Email address')
    rtl.fireEvent.change(emailInput, {
      target: { value: 'ronald@mcdonalds.gov' },
    })

    const emailSubmit = getByText('Send Email')
    rtl.fireEvent.click(emailSubmit)

    expect(qrEmail).toHaveBeenCalledWith(
      'ronald@mcdonalds.gov',
      '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
      'data:image/png;base64,00'
    )
  })
})

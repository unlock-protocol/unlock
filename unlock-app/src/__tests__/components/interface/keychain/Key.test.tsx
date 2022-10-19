import React from 'react'
import * as rtl from '@testing-library/react'
import Key, { KeyProps } from '../../../../components/interface/keychain/Key'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const aKey: KeyProps = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  tokenId: '1',
  createdAtBlock: new Date().getDate(),
  tokenURI:
    'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',
  owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
  lock: {
    id: '1',
    address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0xbadc0ffee',
    price: '50',
    version: '1',
    lockManagers: [],
  },
}

const aKeyWithNoName: KeyProps = {
  ...aKey,
  lock: {
    ...aKey.lock,
    name: '',
  },
}

let signData: jest.Mock<any, any>
let qrEmail: jest.Mock<any, any>
interface RenderProps {
  ownedKey?: KeyProps
}
const render = ({ ownedKey }: RenderProps) => {
  signData = jest.fn()
  qrEmail = jest.fn()
  return rtl.render(
    <Key network={1} account={accountAddress} ownedKey={ownedKey || aKey} />
  )
}

describe.skip('keychain -- Key', () => {
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

    getByText(aKey.lock?.name as string)
  })

  it('should dispatch a payload to be signed', () => {
    expect.assertions(1)
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 1530518207007)
    global.Date.now = dateNowStub
    const { getByText } = render({})

    const button = getByText('Generate QR Code')
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
      <Key network={1} account={accountAddress} ownedKey={aKey} />
    )

    expect(container.querySelector('canvas')).toBeNull()

    rerender(<Key network={1} account={accountAddress} ownedKey={aKey} />)

    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should display a qr code on button click when there is a signature', () => {
    expect.assertions(2)

    const { getByText, container } = render({})

    expect(container.querySelector('canvas')).toBeNull()

    const button = getByText('Display QR Code')
    rtl.fireEvent.click(button)

    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('should send an email when the send button is clicked', () => {
    expect.assertions(1)

    const { getByText, getByPlaceholderText } = render({})

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

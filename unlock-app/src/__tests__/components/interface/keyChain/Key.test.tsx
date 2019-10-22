import React from 'react'
import * as rtl from 'react-testing-library'
import { Key, Props } from '../../../../components/interface/keyChain/Key'
import { OwnedKey } from '../../../../components/interface/keyChain/KeychainTypes'

const accountAddress = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  lock: {
    address: '0x80bc6d2870bb72cb3e37b648c160da20733386f7',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0xbadc0ffee',
    price: '50',
  },
}

let signData: jest.Mock<any, any>
let qrEmail: jest.Mock<any, any>
const render = (signature?: Props['signature']) => {
  signData = jest.fn()
  qrEmail = jest.fn()
  return rtl.render(
    <Key
      signData={signData}
      qrEmail={qrEmail}
      signature={signature || null}
      accountAddress={accountAddress}
      ownedKey={aKey}
    />
  )
}

describe('keyChain -- Key', () => {
  it('should render the lock name', () => {
    expect.assertions(0)
    const { getByText } = render()

    getByText(aKey.lock.name)
  })

  it('should dispatch a payload to be signed', () => {
    expect.assertions(1)
    const realDateNow = Date.now.bind(global.Date)
    const dateNowStub = jest.fn(() => 1530518207007)
    global.Date.now = dateNowStub
    const { getByText } = render()

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
})

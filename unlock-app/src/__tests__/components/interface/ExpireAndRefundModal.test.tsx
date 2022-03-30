import React from 'react'
import * as rtl from '@testing-library/react'
import { OwnedKey } from '../../../components/interface/keychain/KeychainTypes'
import { ExpireAndRefundModal } from '../../../components/interface/ExpireAndRefundModal'

const aKey: OwnedKey = {
  id: '0x80bc6d2870bb72cb3e37b648c160da20733386f7-1',
  expiration: '132546546',
  keyId: '1',
  tokenURI:
    'https://locksmith.unlock-protocol.com/api/key/0x80bc6d2870bb72cb3e37b648c160da20733386f7/1',

  lock: {
    address: '0xf8112a74d38f56e404282c3c5071eaaed0c29b40',
    expirationDuration: '300',
    name: 'ERC20 paywall lock',
    tokenAddress: '0x0000000000000000000000000000000000000000',
    price: '50',
    owner: '0x455375453031ac5fd7cf0e42291f2d8e3df67f85',
  },
}
const dismiss: jest.Mock<any, any> = jest.fn()
const modalActive: React.ReactElement<any> = (
  <ExpireAndRefundModal
    active
    dismiss={dismiss}
    lock={aKey.lock}
    lockAddresses={[aKey.lock.address]}
  />
)
const modalInactive: React.ReactElement<any> = (
  <ExpireAndRefundModal
    active
    dismiss={dismiss}
    lock={undefined}
    lockAddresses={[aKey.lock.address]}
  />
)
const render = () => {
  return rtl.render(modalActive)
}
const renderInactive = () => {
  return rtl.render(modalInactive)
}
describe('ExpireAndRefundModal', () => {
  it('correctly render ExpireAndRefund and have title', () => {
    expect.assertions(2)
    const { container, getByText } = render()
    const title = getByText('Expire and Refund')
    expect(title).toBeDefined()
    expect(container).toBeDefined()
  })

  it('should show error if lock is not passaed as prop', () => {
    expect.assertions(1)
    const { getByText } = renderInactive()
    const message = getByText('No lock selected')
    expect(message).toBeDefined()
  })

  it('should call dismiss when CancelAndRefund confirmed', () => {
    expect.assertions(3)
    const { getByText } = render()

    expect(dismiss).toBeCalledTimes(0)
    const confirmButton = getByText('Expire and Refund')
    expect(confirmButton).toBeDefined()
    rtl.fireEvent.click(confirmButton)
    expect(dismiss).toBeCalledTimes(1)
  })
})

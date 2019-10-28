import React from 'react'
import * as rtl from 'react-testing-library'
import { ethers } from 'ethers'
import { RefundButton } from '../../../components/interface/RefundButton'

jest.mock('ethers')

const config = {
  providers: {
    Metamask: {},
  },
  externalRefundContractAddress: '0x123abc',
  env: 'test' as any,
}

let refundFunction = jest.fn()
describe('RefundButton', () => {
  beforeAll(() => {
    ;(ethers.providers.Web3Provider as any).mockImplementation(() => {
      return {
        getSigner: jest.fn(),
      }
    })
    ;(ethers.Contract as any).mockImplementation(() => {
      return {
        refund: refundFunction,
      }
    })
  })
  it('should render a button to initiate a refund', async () => {
    expect.assertions(1)

    const { getByText, findByText } = rtl.render(
      <RefundButton
        accountAddress="0xdeadbeef"
        lockAddress="0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5"
        config={config}
      />
    )

    const refundButton = getByText('Perform refund')

    rtl.fireEvent.click(refundButton)

    expect(refundFunction).toHaveBeenCalledWith('0xdeadbeef')

    // Button text changes after click
    await findByText('Refund Initiated')
  })

  it('should render nothing if lock address does not match', async () => {
    expect.assertions(1)

    const { container } = rtl.render(
      <RefundButton
        accountAddress="0xdeadbeef"
        lockAddress="0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2"
        config={config}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})

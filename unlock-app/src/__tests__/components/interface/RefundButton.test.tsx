import React from 'react'
import * as rtl from 'react-testing-library'
import { ethers } from 'ethers'
import RefundButton from '../../../components/interface/RefundButton'

jest.mock('ethers')

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
        provider={{}}
        accountAddress="0xdeadbeef"
        externalRefundContractAddress="0xbadc0ffee"
      />
    )

    const refundButton = getByText('Perform refund')

    rtl.fireEvent.click(refundButton)

    expect(refundFunction).toHaveBeenCalledWith('0xdeadbeef')

    // Button text changes after click
    await findByText('Refund Initiated')
  })
})

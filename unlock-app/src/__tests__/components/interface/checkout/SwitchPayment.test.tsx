import React from 'react'
import * as rtl from '@testing-library/react'
import { SwitchPayment } from '../../../../components/interface/checkout/SwitchPayment'

const paymentOptions = ['Credit Card', 'DAI', 'USDC']

describe('SwitchPayment', () => {
  let activePayment: string | null
  let setActivePayment: jest.Mock<any, any>

  beforeEach(() => {
    activePayment = null
    setActivePayment = jest.fn()
  })

  it('displays all the payment options', () => {
    expect.assertions(0)

    const { getByText } = rtl.render(
      <SwitchPayment
        activePayment={activePayment}
        setActivePayment={setActivePayment}
        paymentOptions={paymentOptions}
      />
    )

    paymentOptions.forEach((option) => {
      getByText(option)
    })
  })

  it('displays the active payment option with a distinct component', () => {
    expect.assertions(0)

    const { getByTestId } = rtl.render(
      <SwitchPayment
        activePayment="USDC"
        setActivePayment={setActivePayment}
        paymentOptions={paymentOptions}
      />
    )

    getByTestId('active-USDC')
  })

  it('calls setActivePayment when clicking a non-active payment', () => {
    expect.assertions(1)

    const { getByText } = rtl.render(
      <SwitchPayment
        activePayment={activePayment}
        setActivePayment={setActivePayment}
        paymentOptions={paymentOptions}
      />
    )

    const dai = getByText('DAI')
    rtl.fireEvent.click(dai)

    expect(setActivePayment).toHaveBeenCalledWith('DAI')
  })
})

import React from 'react'
import * as rtl from 'react-testing-library'
import LockInfo from '../../../../components/interface/user-account/LockInfo'

describe('LockInfo component', () => {
  it('should show the loading spinner when price is not present', () => {
    expect.assertions(1)

    const { container } = rtl.render(
      <LockInfo priceBreakdown={{}} timeRemaining="" />
    )

    // There should be exactly one SVG: the loading spinner
    expect(container.querySelectorAll('svg')).toHaveLength(1)
  })

  it('should show the price, breakdown, and duration otherwise', () => {
    expect.assertions(0)

    const keyPrice = '$10.00'
    const creditCardProcessing = '$0.63'
    const unlockServiceFee = '$0.20'
    const total = '$10.83'

    const expectedMessage = `The total price includes the base key price of ${keyPrice}, credit card processing fee of ${creditCardProcessing}, and the Unlock service fee of ${unlockServiceFee}.`

    const { getByText } = rtl.render(
      <LockInfo
        priceBreakdown={{
          keyPrice,
          creditCardProcessing,
          unlockServiceFee,
          total,
        }}
        timeRemaining=""
      />
    )

    // There should be exactly one SVG: the loading spinner
    getByText(expectedMessage)
  })
})

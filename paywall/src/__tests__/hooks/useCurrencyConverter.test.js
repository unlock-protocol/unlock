import axios from 'axios'
import * as rtl from 'react-testing-library'
import React from 'react'
import useCurrencyConverter from '../../hooks/useCurrencyConverter'

jest.mock('axios')

describe('useCurrencyConverter', () => {
  it('should fetch the data from the coinbase api', () => {
    expect.assertions(1)

    function ReactComponent() {
      const conversion = useCurrencyConverter()
      return <div>{JSON.stringify(conversion)}</div>
    }

    rtl.render(<ReactComponent />)
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.coinbase.com/v2/prices/ETH-USD/buy'
    )
  })

  // TODO Add tests to make sure it re-renders!
})

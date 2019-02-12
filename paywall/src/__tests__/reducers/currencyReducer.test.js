import reducer, { initialState } from '../../reducers/currencyReducer'
import { setConversionRate } from '../../actions/currencyconvert'

describe('currency conversion reducer', () => {
  const USD123 = {
    USD: 123,
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toBe(initialState)
  })

  it('should set the conversion rate for USD when receiving a rate for USD', () => {
    expect(reducer(undefined, setConversionRate('USD', '123'))).toEqual(USD123)
  })

  it('should set the conversion rate for EUR when receiving a rate for EUR', () => {
    expect(reducer(USD123, setConversionRate('EUR', '321'))).toEqual({
      USD: 123,
      EUR: 321,
    })
  })
})

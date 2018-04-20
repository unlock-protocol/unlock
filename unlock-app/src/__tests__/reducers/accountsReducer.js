import reducer from '../../reducers/accountsReducer'
import { ACCOUNTS_FETCHED } from '../../actions/accounts'

describe('accounts reducer', () => {

  const accounts = [
    '0x123',
    '0xabc',
  ]

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual([])
  })

  it('should set the accounts accordingly when receiving ACCOUNTS_FETCHED', () => {
    expect(reducer(undefined, {
      type: ACCOUNTS_FETCHED,
      accounts,
    })).toEqual(accounts)
  })

})

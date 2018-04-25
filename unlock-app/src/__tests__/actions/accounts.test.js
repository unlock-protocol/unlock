import { accountsFetched, setAccount, SET_ACCOUNT, ACCOUNTS_FETCHED } from '../../actions/accounts'

describe('accounts actions', () => {

  it('should create an action to set the account', () => {
    const account = '0xabc'
    const expectedAction = {
      type: SET_ACCOUNT,
      account,
    }
    expect(setAccount(account)).toEqual(expectedAction)
  })

  it('should create an action to indicate that accounts have been fetched', () => {
    const accounts = [
      '0xabc',
      '0x123',
    ]
    const expectedAction = {
      type: ACCOUNTS_FETCHED,
      accounts,
    }
    expect(accountsFetched(accounts)).toEqual(expectedAction)
  })
})

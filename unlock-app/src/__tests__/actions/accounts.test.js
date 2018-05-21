import { setAccount, loadAccount, resetAccountBalance, SET_ACCOUNT, LOAD_ACCOUNT, RESET_ACCOUNT_BALANCE } from '../../actions/accounts'

describe('accounts actions', () => {

  it('should create an action to set the account', () => {
    const account = {
      address: '0xabc',
      privateKey: 'deadbeef',
    }
    const expectedAction = {
      type: SET_ACCOUNT,
      account,
    }
    expect(setAccount(account)).toEqual(expectedAction)
  })

  it('should create an action to load and account', () => {
    const privateKey = '0xabc'

    const expectedAction = {
      type: LOAD_ACCOUNT,
      privateKey,
    }
    expect(loadAccount(privateKey)).toEqual(expectedAction)
  })

  it('should create an action to update an account\'s balance', () => {
    const balance = '1337'

    const expectedAction = {
      type: RESET_ACCOUNT_BALANCE,
      balance,
    }
    expect(resetAccountBalance(balance)).toEqual(expectedAction)
  })

})

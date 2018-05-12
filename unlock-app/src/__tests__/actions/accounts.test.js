import { setAccount, loadAccount, SET_ACCOUNT, LOAD_ACCOUNT } from '../../actions/accounts'

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

})

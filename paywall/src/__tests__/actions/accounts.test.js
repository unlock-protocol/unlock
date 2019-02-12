import {
  setAccount,
  updateAccount,
  SET_ACCOUNT,
  UPDATE_ACCOUNT,
} from '../../actions/accounts'

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

  it('should create an action to update an account', () => {
    const update = {
      balance: '1337',
    }

    const expectedAction = {
      type: UPDATE_ACCOUNT,
      update,
    }
    expect(updateAccount(update)).toEqual(expectedAction)
  })
})

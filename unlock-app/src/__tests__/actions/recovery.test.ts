import {
  GOT_RECOVERY_PHRASE,
  gotRecoveryPhrase,
  RESET_RECOVERY_PHRASE,
  resetRecoveryPhrase,
} from '../../actions/recovery'

describe('recovery actions', () => {
  it('should create an action to indicate that we received the recovery phrase', () => {
    expect.assertions(1)
    const recoveryPhrase = 'do not lose this'
    const expectedAction = {
      type: GOT_RECOVERY_PHRASE,
      recoveryPhrase,
    }

    expect(gotRecoveryPhrase(recoveryPhrase)).toEqual(expectedAction)
  })

  it('should create an action to reset the recovery phrase', () => {
    expect.assertions(1)
    const expectedAction = {
      type: RESET_RECOVERY_PHRASE,
    }

    expect(resetRecoveryPhrase()).toEqual(expectedAction)
  })
})

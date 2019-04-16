import {
  startLoading,
  doneLoading,
  START_LOADING,
  DONE_LOADING,
} from '../../actions/loading'

describe('loading actions', () => {
  it('should create an action to start loading', () => {
    expect.assertions(1)
    const expectedAction = {
      type: START_LOADING,
    }
    expect(startLoading()).toEqual(expectedAction)
  })

  it('should create an action to end loading', () => {
    expect.assertions(1)
    const expectedAction = {
      type: DONE_LOADING,
    }
    expect(doneLoading()).toEqual(expectedAction)
  })
})

import {
  showForm,
  hideForm,
  SHOW_FORM,
  HIDE_FORM,
} from '../../actions/lockFormVisibility'

describe('Lock form visibility actions', () => {
  it('should create an action to show the form', () => {
    expect.assertions(1)
    const expectedAction = {
      type: SHOW_FORM,
    }
    expect(showForm()).toEqual(expectedAction)
  })

  it('should create an action to hide the form', () => {
    expect.assertions(1)
    const expectedAction = {
      type: HIDE_FORM,
    }
    expect(hideForm()).toEqual(expectedAction)
  })
})

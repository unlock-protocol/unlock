import {
  showModal,
  SHOW_MODAL,
  hideModal,
  HIDE_MODAL,
  openNewWindowModal,
  OPEN_MODAL_IN_NEW_WINDOW,
} from '../../actions/modal'

describe('modal actions', () => {
  it('should create an action to show a modal', () => {
    expect.assertions(1)
    const modal = ''
    const expectedAction = {
      type: SHOW_MODAL,
      modal,
    }
    expect(showModal(modal)).toEqual(expectedAction)
  })

  it('should create an action to hide a modal', () => {
    expect.assertions(1)
    const modal = ''
    const expectedAction = {
      type: HIDE_MODAL,
      modal,
    }
    expect(hideModal(modal)).toEqual(expectedAction)
  })

  it('should create an action to open the modal in a new window', () => {
    expect.assertions(1)
    expect(openNewWindowModal()).toEqual({
      type: OPEN_MODAL_IN_NEW_WINDOW,
    })
  })
})

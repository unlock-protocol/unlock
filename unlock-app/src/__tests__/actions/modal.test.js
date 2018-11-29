import {
  showModal,
  SHOW_MODAL,
  hideModal,
  HIDE_MODAL,
} from '../../actions/modal'

describe('modal actions', () => {
  it('should create an action to show a modal', () => {
    const modal = ''
    const expectedAction = {
      type: SHOW_MODAL,
      modal,
    }
    expect(showModal(modal)).toEqual(expectedAction)
  })

  it('should create an action to hide a modal', () => {
    const modal = ''
    const expectedAction = {
      type: HIDE_MODAL,
      modal,
    }
    expect(hideModal(modal)).toEqual(expectedAction)
  })
})

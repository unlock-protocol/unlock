import { SHOW_MODAL, HIDE_MODAL } from '../../../actions/modal'

import { mapDispatchToProps } from '../../../components/lock/Overlay'

describe('Overlay', () => {
  describe('mapDispatchToProps', () => {
    it('should yield a prop function which dispatches hideModal with the right value', () => {
      expect.assertions(2)
      const locks = [{ address: '0x123' }, { address: '0x456' }]
      const dispatch = jest.fn()
      const props = mapDispatchToProps(dispatch, { locks })
      props.hideModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: HIDE_MODAL,
      })
      props.showModal()
      expect(dispatch).toHaveBeenCalledWith({
        modal: '0x123-0x456',
        type: SHOW_MODAL,
      })
    })
  })
})

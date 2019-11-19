import { mapStateToProps } from '../../../components/content/NewEventContent'

describe('NewEventContent', () => {
  describe('mapStateToProps', () => {
    it('should yield the lock address based on the url', () => {
      expect.assertions(1)
      const event = {}
      const config = {}
      const props = mapStateToProps({ event }, { config })
      expect(props).toEqual({
        event,
        config,
        lockAddress: '',
      })
    })
  })
})

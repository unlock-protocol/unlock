import { mapStateToProps } from '../../../components/content/DemoContent'

describe('Demo page content', () => {
  describe('mapStateToProps', () => {
    it('extracts the lock address from router pathname', () => {
      expect.assertions(1)
      const lock = '0x1234567890123456789012345678901234567890'

      expect(
        mapStateToProps({
          router: {
            location: {
              pathname: '/' + lock,
            },
          },
        })
      ).toEqual({ lock })
    })
  })
})

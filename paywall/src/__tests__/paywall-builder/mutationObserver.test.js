import listenForNewLocks from '../../paywall-builder/mutationObserver'

function mockHead(content = false) {
  return {
    querySelector() {
      if (!content) return false
      return {
        getAttribute() {
          return content
        },
      }
    },
  }
}

describe('mutationObserver', () => {
  describe('listenForNewLocks', () => {
    let callback
    let fail
    beforeEach(() => {
      callback = jest.fn()
      fail = jest.fn()
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    it('immediately calls callback if a lock meta tag already exists in the page', () => {
      expect.assertions(1)
      listenForNewLocks(callback, () => {}, mockHead('hi'))
      expect(callback).toBeCalledWith('hi')
    })
    it('calls fail if a meta tag is not found', () => {
      expect.assertions(1)
      const head = mockHead()
      listenForNewLocks(callback, fail, head)

      expect(fail).toHaveBeenCalled()
    })
  })
})

import {
  listenForNewLocks,
  changeListener,
} from '../../paywall-builder/mutationObserver'

function tag(tagName, name, content) {
  return { nodeName: tagName.toUpperCase(), name, content }
}

function makeMutation(nodes = []) {
  if (!nodes.length) return {}
  return [
    {
      addedNodes: {
        length: nodes.length,
        entries() {
          return nodes
            .map(node => {
              return [0, node]
            })
            [Symbol.iterator]()
        },
      },
    },
  ]
}

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
  describe('changeListener', () => {
    let callback
    beforeEach(() => {
      callback = jest.fn()
    })
    it('bails if no nodes added', () => {
      expect.assertions(1)
      changeListener(callback, [])
      expect(callback).not.toBeCalled()
    })
    it('bails if node is not a meta tag', () => {
      expect.assertions(1)
      const mutations = makeMutation([tag('notmeta', 'hi', 'content')])
      changeListener(callback, mutations)
      expect(callback).not.toBeCalled()
    })
    it('bails if node is not a meta tag named "lock"', () => {
      expect.assertions(1)
      const mutations = makeMutation([
        tag('notmeta', 'hi', 'content'),
        tag('meta', 'hi', 'content2'),
      ])
      changeListener(callback, mutations)
      expect(callback).not.toBeCalled()
    })
    it('calls callback with content attribute', () => {
      expect.assertions(1)
      const mutations = makeMutation([
        tag('notmeta', 'hi', 'content'),
        tag('meta', 'hi', 'content2'),
        tag('meta', 'lock', 'content3'),
      ])
      changeListener(callback, mutations)
      expect(callback).toBeCalledWith('content3')
    })
  })

  describe('listenForNewLocks', () => {
    let callback
    let observer
    beforeEach(() => {
      callback = jest.fn()
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })
    it('immediately calls callback if a lock meta tag already exists in the page', () => {
      expect.assertions(1)
      listenForNewLocks(callback, mockHead('hi'))
      expect(callback).toBeCalledWith('hi')
    })
    it('creates MutationObserver and calls observe', () => {
      expect.assertions(3)
      global.MutationObserver = function() {
        this.observe = jest.fn()
        observer = this
      }
      jest.spyOn(changeListener, 'bind')
      const head = mockHead()

      listenForNewLocks(callback, head)

      expect(changeListener.bind).toHaveBeenCalledWith(null, callback)
      expect(observer).not.toBeUndefined()
      expect(observer.observe).toHaveBeenCalledWith(head, {
        attributes: true,
        childList: true,
      })
    })
  })
})

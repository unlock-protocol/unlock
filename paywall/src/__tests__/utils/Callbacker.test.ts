import Callbacker from '../../utils/Callbacker'

let cb: Callbacker

describe('Callbacker', () => {
  describe('generateId', () => {
    beforeAll(() => {
      cb = new Callbacker()
    })

    it('should generate monotonically increasing ids to refer to callbacks', () => {
      expect.assertions(3)

      let id = cb.generateId('tests')
      expect(id).toEqual('tests0')

      id = cb.generateId('tests')
      expect(id).toEqual('tests1')

      id = cb.generateId('tests')
      expect(id).toEqual('tests2')
    })

    it('should be able to keep track of different kinds of callbacks', () => {
      expect.assertions(3)

      let id = cb.generateId('samples')
      expect(id).toEqual('samples0')

      id = cb.generateId('samples')
      expect(id).toEqual('samples1')

      // just throwing this one in to prove that the counts are kept separate from each other
      id = cb.generateId('tests')
      expect(id).toEqual('tests3')
    })
  })

  describe('adding and calling', () => {
    beforeEach(() => {
      cb = new Callbacker()
    })

    it('should let you add and call a callback, once', () => {
      expect.assertions(3)

      const fn = jest.fn()
      const payload = {
        data: 'this is just an arbitrary object',
        otherStuff: [1, 2, 3],
      }
      const id = cb.addCallback('tests', fn)

      // is true if the callback exists in the table
      let calledFn = cb.call(id, payload)

      expect(fn).toHaveBeenCalledWith(payload)
      expect(calledFn).toBeTruthy()

      // should be false this time, because the callback is no longer in the table
      calledFn = cb.call(id, payload)
      expect(calledFn).toBeFalsy()
    })

    it('should be able to keep track of and call multiple callbacks', () => {
      expect.assertions(3)

      const data = [
        {
          namespace: 'tests',
          callback: jest.fn(),
          payload: 'the number twelve',
        },
        {
          namespace: 'tests',
          callback: jest.fn(),
          payload: {
            number: 12,
          },
        },
        {
          namespace: 'vegetables',
          callback: jest.fn(),
          payload: {
            leafy: ['kale', 'lettuce', 'quinoa?'],
            nonLeafy: ['eggplant', 'swiss chard?'],
          },
        },
      ]

      const ids: string[] = []
      data.forEach(({ namespace, callback }) => {
        ids.push(cb.addCallback(namespace, callback))
      })

      ids.forEach((id, i) => {
        cb.call(id, data[i].payload)
      })

      data.forEach(({ callback }, i) => {
        expect(callback).toHaveBeenCalledWith(data[i].payload)
      })
    })
  })
})

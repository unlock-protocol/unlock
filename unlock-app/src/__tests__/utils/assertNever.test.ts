import { assertNever } from '../../utils/assertNever'

describe('assertNever', () => {
  it('throws', () => {
    expect.assertions(1)

    expect(assertNever).toThrow()
  })
})

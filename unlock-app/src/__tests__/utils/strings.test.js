import { camelCaseToTitle } from '../../utils/strings'

describe('camelCaseToTitle helper', () => {
  it('transforms itself', () => {
    expect.assertions(1)
    expect(camelCaseToTitle('camelCaseToTitle')).toEqual('Camel Case To Title')
  })
})

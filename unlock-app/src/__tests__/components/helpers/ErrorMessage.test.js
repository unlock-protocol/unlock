import * as rtl from 'react-testing-library'
import * as Errors from '../../../errors'
import ErrorMessage from '../../../components/helpers/ErrorMessage'

describe('Errors', () => {
  it('all known errors should have a default message', () => {
    Object.keys(Errors).forEach(error => {
      try {
        expect(ErrorMessage(error)).not.toBe(null)
      } catch (e) {
        // this allows us to see which error has no default message
        expect('has a default message').toBe(error)
      }
    })
  })

  it('errors which are not prededifined should have a generic message', () => {
    const wrapper = rtl.render(ErrorMessage('Broken!'))
    expect(
      wrapper.queryByText(
        'There was an error (Broken!). Please retry and report if it happens again.'
      )
    ).not.toBeNull()
  })
})

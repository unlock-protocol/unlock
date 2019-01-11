import * as rtl from 'react-testing-library'
import * as Errors from '../../../errors'
import ErrorMessage from '../../../components/helpers/ErrorMessage'

describe('Errors', () => {
  it('all known errors should have a default message', () => {
    Object.keys(Errors).forEach(error => {
      expect(ErrorMessage(error)).not.toBe(null)
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

import React from 'react'
import * as rtl from 'react-testing-library'
import { Provider } from 'react-redux'
import createUnlockStore from '../../../createUnlockStore'
import { AuthenticationPrompt } from '../../../components/interface/AuthenticationPrompt'

const store = createUnlockStore({})

let wrapper: rtl.RenderResult<typeof rtl.queries>
let gotCredentials: any

afterEach(rtl.cleanup)
describe('Authentication Prompt', () => {
  beforeEach(() => {
    gotCredentials = jest.fn()
    wrapper = rtl.render(
      <Provider store={store}>
        <AuthenticationPrompt gotCredentials={gotCredentials} />
      </Provider>
    )
  })

  it('should dispatch a GOT_CREDENTIALS action when submit is clicked', () => {
    expect.assertions(3)
    const { container } = wrapper
    const submitButton = container.querySelector('input[type="submit"]')
    expect(submitButton).not.toBeNull()
    expect(gotCredentials).not.toHaveBeenCalled()
    if (submitButton) {
      rtl.fireEvent.click(submitButton)
      expect(gotCredentials).toHaveBeenCalledTimes(1)
    }
  })
})

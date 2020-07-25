import React from 'react'
import * as rtl from '@testing-library/react'
import {
  SignUp,
  mapDispatchToProps,
  mapStateToProps,
} from '../../../../components/interface/user-account/SignUp'
import { SIGNUP_EMAIL } from '../../../../actions/user'
import doNothing from '../../../../utils/doNothing'
import wedlocksUtils from '../../../../utils/wedlocks'

const mockWedlocksUtil = { verifyEmailSignature: jest.fn() }

jest.mock('../../../../utils/wedlocks', () => {
  return jest.fn().mockImplementation(() => {
    return mockWedlocksUtil
  })
})

let wrapper: rtl.RenderResult<typeof rtl.queries>
let signupEmail: (email: string) => any

afterEach(rtl.cleanup)

describe('Sign Up Page', () => {
  beforeEach(() => {
    signupEmail = jest.fn((email: string) => email)
    wrapper = rtl.render(
      <SignUp signupEmail={signupEmail} toggleSignup={doNothing} />
    )
  })

  describe('mapDispatchToProps', () => {
    it('should map the dispatch to the props', () => {
      expect.assertions(2)
      const emailAddress = 'send@mem.es'
      const dispatch = jest.fn((event) => {
        expect(event.type).toBe(SIGNUP_EMAIL)
        expect(event.emailAddress).toBe(emailAddress)
      })
      const { signupEmail } = mapDispatchToProps(dispatch)
      signupEmail(emailAddress)
    })
  })

  describe('mapStateToProps', () => {
    it('should yield the emailAddress from the location if there is one', () => {
      expect.assertions(1)
      const state = {
        router: {
          location: {
            search: '?email=julien@unlock-protocol.com',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      const { emailAddress } = mapStateToProps(state)
      expect(emailAddress).toEqual('julien@unlock-protocol.com')
    })

    it('should yield the first emailAddress from the location if there are several', () => {
      expect.assertions(1)
      const state = {
        router: {
          location: {
            search:
              '?email=julien@unlock-protocol.com&email=chris@unlock-protocol.com',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      const { emailAddress } = mapStateToProps(state)
      expect(emailAddress).toEqual('julien@unlock-protocol.com')
    })

    it('should yield no emailAddress from the location if there are none', () => {
      expect.assertions(1)
      const state = {
        router: {
          location: {
            search: '',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      const { emailAddress } = mapStateToProps(state)
      expect(emailAddress).toEqual(undefined)
    })

    it('should yield isLinkValid to false if signedEmail was not signed by wedlocks', () => {
      expect.assertions(2)

      const state = {
        router: {
          location: {
            search:
              '?email=hello@unlock-protocol.com&signedEmail=notavalidsignature',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      wedlocksUtils.verifyEmailSignature = jest.fn(() => {
        return false
      })

      const { isLinkValid } = mapStateToProps(state)
      expect(wedlocksUtils.verifyEmailSignature).toHaveBeenCalledWith(
        'hello@unlock-protocol.com',
        'notavalidsignature'
      )
      expect(isLinkValid).toEqual(false)
    })

    it('should yield isLinkValid to true if signedEmail was signed by wedlocks', () => {
      expect.assertions(2)

      const state = {
        router: {
          location: {
            search:
              '?email=hello@unlock-protocol.com&signedEmail=validSignature',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      wedlocksUtils.verifyEmailSignature = jest.fn(() => {
        return true
      })

      const { isLinkValid } = mapStateToProps(state)
      expect(wedlocksUtils.verifyEmailSignature).toHaveBeenCalledWith(
        'hello@unlock-protocol.com',
        'validSignature'
      )
      expect(isLinkValid).toEqual(true)
    })

    it('should yield the account is the user is logged in', () => {
      expect.assertions(1)

      const state = {
        account: {
          address: '0x123',
          balance: '0',
        },
        router: {
          location: {
            search: '',
            hash: '',
            host: '',
            hostname: '',
            href: '',
            origin: '',
            pathname: '',
            port: '',
            protocol: '',
            assign: () => {},
            reload: () => {},
            replace: () => {},
            ancestorOrigins: {
              length: 0,
              contains: (_: string) => false,
              item: (_: number) => null,
            },
          },
        },
      }

      const { account } = mapStateToProps(state)
      expect(account).toEqual(state.account)
    })
  })

  it('should update the input field on change', () => {
    expect.assertions(1)
    const email = 'snsv@computer.net'
    const { getByPlaceholderText } = wrapper
    const inputNode = getByPlaceholderText(
      'Enter your email to get started'
    ) as HTMLInputElement
    rtl.fireEvent.change(inputNode, { target: { value: email } })
    expect(inputNode.value).toBe(email)
  })

  it('should dispatch a SIGNUP_EMAIL action and hide the form when submit is clicked', () => {
    expect.assertions(3)
    const { container, getByText } = wrapper
    const submitButton = container.querySelector('input[type="submit"]')
    expect(submitButton).not.toBeNull()
    expect(signupEmail).not.toHaveBeenCalled()
    if (submitButton) {
      rtl.fireEvent.click(submitButton)
      expect(signupEmail).toHaveBeenCalledWith('')
      getByText('Please check your email')
    }
  })

  it('should render InvalidLink if we have an email address but link is not valid', () => {
    expect.assertions(0)
    const signupEmail = jest.fn((email: string) => email)
    const { getByText } = rtl.render(
      <SignUp
        signupEmail={signupEmail}
        toggleSignup={doNothing}
        emailAddress="john@smi.th"
        isLinkValid={false}
      />
    )

    // RTL got confused by the DOM structure here, needed to write a matcher function
    getByText((_, node) => {
      return node.innerHTML.startsWith(
        'The link you used is invalid. Please try again.'
      )
    })
  })

  it('should render SignUpSuccess if we have an account and address', () => {
    expect.assertions(0)
    const signupEmail = jest.fn((email: string) => email)
    const { getByText } = rtl.render(
      <SignUp
        signupEmail={signupEmail}
        toggleSignup={doNothing}
        account={{
          address: '0x12345678',
          balance: '0',
        }}
      />
    )

    getByText((_, node) => {
      return node.innerHTML.startsWith('You are now signed in!')
    })
  })
})

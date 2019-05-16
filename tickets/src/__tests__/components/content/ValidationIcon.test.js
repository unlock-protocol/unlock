import React from 'react'
import * as rtl from 'react-testing-library'
import {
  ValidationIcon,
  mapStateToProps,
} from '../../../components/content/validate/ValidationIcon'

describe('ValidationIcon', () => {
  it('should display a valid notice when the valid property is set to true', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ValidationIcon valid verifySignedAddress={jest.fn()} />
    )

    expect(wrapper.getByText('Ticket Valid')).not.toBeNull()
  })
  it('should display an invalid notice when the valid property is set to false', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ValidationIcon valid={false} verifySignedAddress={jest.fn()} />
    )

    expect(wrapper.getByText('Ticket Not Valid')).not.toBeNull()
  })
  it('should display a validating notice when the valid property is not set yet', () => {
    expect.assertions(1)

    const wrapper = rtl.render(
      <ValidationIcon valid={null} verifySignedAddress={jest.fn()} />
    )

    expect(wrapper.getByText('Ticket Validating')).not.toBeNull()
  })
})

describe('mapStateToProps', () => {
  it('should return valid is true if there is a key and the signature is marked as valid', () => {
    expect.assertions(1)

    const publicKey = '0x123'
    const eventAddress = '0x321'

    const { valid } = mapStateToProps(
      {
        tickets: {
          valid: {
            signature: publicKey,
          },
        },
        keys: {
          mykey: {
            lock: eventAddress,
            owner: publicKey,
            expiration: new Date().getTime() / 1000 + 86400,
          },
        },
      },
      {
        signature: 'signature',
        publicKey,
        eventAddress,
      }
    )

    expect(valid).toBe(true)
  })

  it('should return invalid if there is an expired key and the signature is marked as valid', () => {
    expect.assertions(1)

    const publicKey = '0x123'
    const eventAddress = '0x321'

    const { valid } = mapStateToProps(
      {
        tickets: {
          valid: {
            signature: publicKey,
          },
        },
        keys: {
          mykey: {
            lock: eventAddress,
            owner: publicKey,
            expiration: 1,
          },
        },
      },
      {
        signature: 'signature',
        publicKey,
        eventAddress,
      }
    )

    expect(valid).toBe(false)
  })

  it('should return null if there is no key yet but the signature is marked as valid', () => {
    expect.assertions(1)

    const publicKey = '0x123'
    const eventAddress = '0x321'

    const { valid } = mapStateToProps(
      {
        tickets: {
          valid: {
            signature: publicKey,
          },
        },
        keys: {},
      },
      {
        signature: 'signature',
        publicKey,
        eventAddress,
      }
    )

    expect(valid).toBe(null)
  })

  it('should return invalid if there is a key but the signature is marked as invalid', () => {
    expect.assertions(1)

    const publicKey = '0x123'
    const eventAddress = '0x321'

    const { valid } = mapStateToProps(
      {
        tickets: {
          invalid: {
            signature: publicKey,
          },
        },
        keys: {
          mykey: {
            lock: eventAddress,
            owner: publicKey,
            expiration: new Date().getTime() / 1000 + 86400,
          },
        },
      },
      {
        signature: 'signature',
        publicKey,
        eventAddress,
      }
    )

    expect(valid).toBe(false)
  })
})

import * as validators from '../../utils/validators'

describe('Form field validators', () => {
  it('isMissing', () => {
    expect.assertions(6)
    expect(validators.isNotEmpty('hi')).toBeTruthy()
    expect(validators.isNotEmpty('0')).toBeTruthy()
    expect(validators.isNotEmpty(0)).toBeTruthy()

    expect(validators.isNotEmpty('')).toBeFalsy()
    expect(validators.isNotEmpty(null)).toBeFalsy()
    expect(validators.isNotEmpty(false)).toBeFalsy()
  })

  it('isPositiveInteger', () => {
    expect.assertions(8)
    expect(validators.isPositiveInteger('1')).toBeTruthy()
    expect(
      validators.isPositiveInteger(
        '178941236598123465918347651983476519387456918736459813476598123645891765894765'
      )
    ).toBeTruthy()

    expect(validators.isPositiveInteger('0')).toBeTruthy()
    expect(validators.isPositiveInteger('-1')).toBeFalsy()
    expect(validators.isPositiveInteger('1.1')).toBeFalsy()
    expect(validators.isPositiveInteger('av')).toBeFalsy()
    expect(validators.isPositiveInteger(null)).toBeFalsy()
    expect(validators.isPositiveInteger(false)).toBeFalsy()
  })

  it('isPositiveNumber', () => {
    expect.assertions(7)
    expect(validators.isPositiveNumber('1.3')).toBeTruthy()
    expect(validators.isPositiveNumber('0.002')).toBeTruthy()

    expect(validators.isPositiveNumber('0')).toBeTruthy()
    expect(validators.isPositiveNumber('-1')).toBeFalsy()
    expect(validators.isPositiveNumber('av')).toBeFalsy()
    expect(validators.isPositiveNumber(null)).toBeFalsy()
    expect(validators.isPositiveNumber(false)).toBeFalsy()
  })

  it('isAccount', () => {
    expect.assertions(4)

    expect(
      validators.isAccount('0x12345678901234567890abcdef0123ABCDEF0123')
    ).toBeTruthy()
    expect(
      validators.isAccount('00x12345678901234567890abcdef0123ABCDEF0123')
    ).toBeFalsy()
    expect(
      validators.isAccount('0x12345678901234567890abcdef0123ABCDEF01234')
    ).toBeFalsy()
    expect(
      validators.isAccount('0X12345678901234567890abcdef0123ABCDEF0123')
    ).toBeFalsy()
  })

  describe('isValidPaywallConfig', () => {
    const lock = '0x1234567890123456789012345678901234567890'
    const validConfig = {
      callToAction: {
        default: 'hi',
        expired: 'there',
        pending: 'pending',
        confirmed: 'confirmed',
      },
      locks: {
        [lock]: {
          name: 'hi',
        },
      },
      icon: 'http://hi.com',
    }

    describe('failures', () => {
      it('config is falsy', () => {
        expect.assertions(4)

        expect(validators.isValidPaywallConfig(false)).toBe(false)
        expect(validators.isValidPaywallConfig(null)).toBe(false)
        expect(validators.isValidPaywallConfig(0)).toBe(false)
        expect(validators.isValidPaywallConfig('')).toBe(false)
      })

      it('config is not an object', () => {
        expect.assertions(3)

        expect(validators.isValidPaywallConfig('hi')).toBe(false)
        expect(validators.isValidPaywallConfig(1)).toBe(false)
        expect(validators.isValidPaywallConfig([])).toBe(false)
      })

      it('config has wrong number of properties', () => {
        expect.assertions(2)

        expect(
          validators.isValidPaywallConfig({
            hi: 1,
            there: 2,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            hi: 1,
            there: 2,
            I: 3,
            suck: 4,
          })
        ).toBe(false)
      })

      it('config keys are unrecognized', () => {
        expect.assertions(3)

        expect(
          validators.isValidPaywallConfig({
            locks: 1,
            icon: 2,
            callToLaziness: 3,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            locks: 1,
            iconic: 2,
            callToAction: 3,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            goldilocks: 1,
            icon: 2,
            callToAction: 3,
          })
        ).toBe(false)
      })

      it('icon', () => {
        expect.assertions(3)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: [],
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: {},
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 1,
          })
        ).toBe(false)
      })

      describe('callToAction', () => {
        const noConfirmed = {
          default: 'default',
          expired: 'expired',
          pending: 'pending',
        }
        const noPending = {
          default: 'default',
          expired: 'expired',
          confirmed: 'confirmed',
        }
        const noExpired = {
          default: 'default',
          pending: 'pending',
          confirmed: 'confirmed',
        }
        const noDefault = {
          expired: 'expired',
          pending: 'pending',
          confirmed: 'confirmed',
        }

        it('callToAction has too many keys', () => {
          expect.assertions(1)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              callToAction: {
                oops: 1,
                I: 2,
                did: 3,
                it: 4,
                again: 5,
              },
            })
          ).toBe(false)
        })

        it.each([noConfirmed, noPending, noExpired, noDefault])(
          'callToAction has unrecognized keys',
          defaults => {
            expect.assertions(1)

            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: {
                  ...defaults,
                  nubbin: 'oops',
                },
              })
            ).toBe(false)
          }
        )

        it.each(['default', 'expired', 'pending', 'confirmed'])(
          'callToAction.%s is malformed',
          key => {
            expect.assertions(5)

            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: false,
              })
            ).toBe(false)
            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: {
                  [key]: false,
                },
              })
            ).toBe(false)
            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: {
                  [key]: 1,
                },
              })
            ).toBe(false)
            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: {
                  [key]: {},
                },
              })
            ).toBe(false)
            expect(
              validators.isValidPaywallConfig({
                ...validConfig,
                callToAction: {
                  [key]: [],
                },
              })
            ).toBe(false)
          }
        )
      })

      it('locks is falsy', () => {
        expect.assertions(4)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: null,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: false,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: 0,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: '',
          })
        ).toBe(false)
      })

      it('icon is not an string', () => {
        expect.assertions(2)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: [],
          })
        ).toBe(false)
      })

      it('icon is not a valid url', () => {
        expect.assertions(4)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon:
              '"><script type="text/javascript>alert("XSS");</script><img src="http://example.com/img.jpg',
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'notaURL',
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: '/test.jpg',
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'gerbils://eat.poo/fancy.jpg',
          })
        ).toBe(false)
      })

      it('locks is not an object', () => {
        expect.assertions(3)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: 'null',
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: [],
          })
        ).toBe(false)
      })

      it('locks has no locks', () => {
        expect.assertions(1)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: {},
          })
        ).toBe(false)
      })

      describe('locks', () => {
        it('lock address is malformed', () => {
          expect.assertions(3)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                notalock: {
                  name: 'hahaha',
                },
              },
            })
          ).toBe(false)

          const endsWithZ = lock.substring(0, lock.length - 1) + 'Z'
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [endsWithZ]: {
                  name: 'hahaha I end in Z',
                },
              },
            })
          ).toBe(false)

          const tooLong = lock + 'a'
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [tooLong]: {
                  name: 'hahaha I am too long',
                },
              },
            })
          ).toBe(false)
        })

        it('lock is not an object', () => {
          expect.assertions(4)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: false,
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: null,
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: 0,
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: '',
              },
            })
          ).toBe(false)
        })

        it('lock has wrong number of properties', () => {
          expect.assertions(1)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  name: 'hi',
                  whatthe: 'hey?',
                },
              },
            })
          ).toBe(false)
        })

        it('lock has no name', () => {
          expect.assertions(1)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  whatthe: 'hey?',
                },
              },
            })
          ).toBe(false)
        })

        it('lock name is not a string', () => {
          expect.assertions(4)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  name: {},
                },
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  name: [],
                },
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  name: null,
                },
              },
            })
          ).toBe(false)
          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              locks: {
                [lock]: {
                  name: 0,
                },
              },
            })
          ).toBe(false)
        })
      })
    })

    describe('valid cases', () => {
      it('is valid config', () => {
        expect.assertions(8)

        expect(validators.isValidPaywallConfig(validConfig)).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: false,
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'https://example.com/img.png',
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            callToAction: {
              default: 'hi',
            },
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: '//example.com/img.png',
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            callToAction: {
              default: 'hi',
              expired: 'hi',
            },
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            callToAction: {
              default: 'hi',
              expired: 'hi',
              pending: 'hi',
            },
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'ftp://example.com/img.png',
          })
        ).toBe(true)
      })
    })
  })

  describe('isValidKey', () => {
    const validKey = {
      expiration: 1,
      transactions: [],
      status: 'none',
      confirmations: 0,
      owner: '0x1234567890123456789012345678901234567890',
    }

    describe('failures', () => {
      it('should fail with invalid objects', () => {
        expect.assertions(5)

        expect(validators.isValidKey(false)).toBe(false)
        expect(validators.isValidKey('hi')).toBe(false)
        expect(validators.isValidKey(0)).toBe(false)
        expect(validators.isValidKey([])).toBe(false)
        expect(
          validators.isValidKey({
            expiration: 1,
            transactions: [],
            status: 'hi',
            confirmations: 2,
            notakey: 4,
          })
        ).toBe(false)
      })

      it('should fail if expiration is invalid', () => {
        expect.assertions(4)

        expect(
          validators.isValidKey({
            ...validKey,
            expiration: null,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            expiration: [],
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            expiration: '1',
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            expiration: {},
          })
        ).toBe(false)
      })

      it('should fail if transactions is not an array', () => {
        expect.assertions(4)

        expect(
          validators.isValidKey({
            ...validKey,
            transactions: null,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            transactions: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            transactions: 'hi',
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            transactions: {},
          })
        ).toBe(false)
      })

      it('should fail if status is not a string', () => {
        expect.assertions(4)

        expect(
          validators.isValidKey({
            ...validKey,
            status: null,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            status: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            status: [],
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            status: {},
          })
        ).toBe(false)
      })

      it('should fail if status is not a known value', () => {
        expect.assertions(1)

        expect(
          validators.isValidKey({
            ...validKey,
            status: 'notvalid',
          })
        ).toBe(false)
      })

      it('should fail if confirmations is invalid', () => {
        expect.assertions(4)

        expect(
          validators.isValidKey({
            ...validKey,
            confirmations: null,
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            confirmations: '1',
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            confirmations: [],
          })
        ).toBe(false)
        expect(
          validators.isValidKey({
            ...validKey,
            confirmations: {},
          })
        ).toBe(false)
      })

      it('should fail if owner is not a valid ethereum address', () => {
        expect.assertions(1)

        expect(
          validators.isValidKey({
            ...validKey,
            owner: '0xIamnot a valid ethereum address',
          })
        ).toBe(false)
      })
    })

    describe('valid keys', () => {
      it('should accept a basic valid key', () => {
        expect.assertions(1)

        expect(validators.isValidKey(validKey)).toBe(true)
      })

      it('should accept a basic valid key with optional id', () => {
        expect.assertions(1)

        expect(
          validators.isValidKey({
            ...validKey,
            id: 'id',
          })
        ).toBe(true)
      })

      describe('status', () => {
        it.each([
          'none',
          'confirming',
          'confirmed',
          'expired',
          'valid',
          'submitted',
          'pending',
          'failed',
        ])('should accept "%s" as a valid status', status => {
          expect.assertions(1)

          expect(
            validators.isValidKey({
              ...validKey,
              status,
            })
          ).toBe(true)
        })
      })
    })
  })

  describe('isValidLock', () => {
    const validLock = {
      address: '0x1234567890123456789009876543210987654321',
      keyPrice: '123',
      expirationDuration: 123,
      key: {
        expiration: 1,
        transactions: [],
        status: 'none',
        confirmations: 0,
        owner: '0x1234567890123456789012345678901234567890',
      },
    }
    describe('failures', () => {
      it('should fail with invalid objects', () => {
        expect.assertions(6)

        expect(validators.isValidLock(false)).toBe(false)
        expect(validators.isValidLock('hi')).toBe(false)
        expect(validators.isValidLock(0)).toBe(false)
        expect(validators.isValidLock([])).toBe(false)
        expect(
          validators.isValidLock({
            address: 1,
            keyPrice: [],
            expirationDuration: 'hi',
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            address: 1,
            keyPrice: [],
            expirationDuration: 'hi',
            kery: {},
          })
        ).toBe(false)
      })

      it('should fail on invalid name', () => {
        expect.assertions(4)

        expect(
          validators.isValidLock({
            ...validLock,
            name: null,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            name: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            name: [],
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            name: {},
          })
        ).toBe(false)
      })

      it('should fail on invalid lock address', () => {
        expect.assertions(5)

        expect(
          validators.isValidLock({
            ...validLock,
            address: null,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            address: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            address: [],
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            address: {},
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            address: 'not a valid lock address',
          })
        ).toBe(false)
      })

      it('should fail on invalid lock keyPrice', () => {
        expect.assertions(5)

        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: null,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: 1,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: [],
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: {},
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: 'not a valid key price',
          })
        ).toBe(false)
      })

      it('should fail on invalid lock expirationDuration', () => {
        expect.assertions(4)

        expect(
          validators.isValidLock({
            ...validLock,
            expirationDuration: null,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            expirationDuration: '1',
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            expirationDuration: [],
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            expirationDuration: {},
          })
        ).toBe(false)
      })

      it('should fail on invalid lock key', () => {
        expect.assertions(1)
        expect(
          validators.isValidLock({
            ...validLock,
            key: null,
          })
        ).toBe(false)
      })
    })

    describe('valid locks', () => {
      it('should accept a basic valid lock', () => {
        expect.assertions(1)

        expect(validators.isValidLock(validLock)).toBe(true)
      })
    })
  })

  describe('isValidLocks', () => {
    const validLock = {
      address: '0x1234567890123456789009876543210987654321',
      keyPrice: '123',
      expirationDuration: 123,
      key: {
        expiration: 1,
        transactions: [],
        status: 'none',
        confirmations: 0,
        owner: '0x1234567890123456789012345678901234567890',
      },
    }
    const invalidLock = {
      ...validLock,
      address: 'not a valid lock',
    }

    it('should fail on invalid locks', () => {
      expect.assertions(3)

      expect(validators.isValidLocks(null)).toBe(false)
      expect(validators.isValidLocks('hi')).toBe(false)
      expect(validators.isValidLocks([])).toBe(false)
    })

    it('should fail on any invalid locks', () => {
      expect.assertions(1)

      expect(
        validators.isValidLocks({
          [validLock.address]: validLock,
          invalidLock,
        })
      ).toBe(false)
    })

    it('should succeed if all locks are valid', () => {
      expect.assertions(1)
      const address = '0x0987654321098765432109876543210987654321'

      expect(
        validators.isValidLocks({
          [validLock.address]: validLock,
          [address]: {
            ...validLock,
            address,
          },
        })
      ).toBe(true)
    })
  })
})

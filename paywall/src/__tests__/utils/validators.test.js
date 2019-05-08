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
      icon: 'hi',
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
        expect.assertions(5)

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
            callToAction: {
              default: 'hi',
            },
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
      })
    })
  })
})

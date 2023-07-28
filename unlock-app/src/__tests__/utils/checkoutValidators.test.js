// TODO: remove, some part related to old checkout (callToAction)

import { vi, describe, beforeAll, expect, it } from 'vitest'
import * as validators from '../../utils/checkoutValidators'

describe('Form field validators', () => {
  it('isMissing ', () => {
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
    expect.assertions(5)

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
    expect(validators.isAccount(null)).toBeFalsy()
  })

  it('isAccountOrNull', () => {
    expect.assertions(5)

    expect(
      validators.isAccountOrNull('0x12345678901234567890abcdef0123ABCDEF0123')
    ).toBeTruthy()
    expect(
      validators.isAccountOrNull('00x12345678901234567890abcdef0123ABCDEF0123')
    ).toBeFalsy()
    expect(
      validators.isAccountOrNull('0x12345678901234567890abcdef0123ABCDEF01234')
    ).toBeFalsy()
    expect(
      validators.isAccountOrNull('0X12345678901234567890abcdef0123ABCDEF0123')
    ).toBeFalsy()
    expect(validators.isAccountOrNull(null)).toBeTruthy()
  })

  describe('isValidKeys', () => {
    it('should be true', () => {
      expect.assertions(1)
      const keys = {}
      expect(validators.isValidKeys(keys)).toBe(true)
    })
  })

  describe('isValidTransactions', () => {
    it('should be true', () => {
      expect.assertions(1)
      const transactions = {}
      expect(validators.isValidTransactions(transactions)).toBe(true)
    })
  })

  describe('isValidBalance', () => {
    it('should be true if the balance is empty', () => {
      expect.assertions(1)
      const balance = {}
      expect(validators.isValidBalance(balance)).toBe(true)
    })
    it('should be true if the balance is valid', () => {
      expect.assertions(1)
      const balance = {
        ether: '0.12',
      }
      expect(validators.isValidBalance(balance)).toBe(true)
    })
    it('should be true if the balance is valid with 2 currencies', () => {
      expect.assertions(1)
      const balance = {
        ether: '0.12',
        erc20: '100',
      }
      expect(validators.isValidBalance(balance)).toBe(true)
    })
    describe('failures', () => {
      it('should be false if the balance is not an object', () => {
        expect.assertions(1)
        const balance = 3
        expect(validators.isValidBalance(balance)).toBe(false)
      })
      it('should be false if the balance is falsy', () => {
        expect.assertions(1)
        const balance = false
        expect(validators.isValidBalance(balance)).toBe(false)
      })
      it('should be false if the balance is an array', () => {
        expect.assertions(1)
        const balance = []
        expect(validators.isValidBalance(balance)).toBe(false)
      })
      it('should be false if the balance includes at least one invalid amont', () => {
        expect.assertions(1)
        const balance = {
          ether: '0.12',
          erc20: 100,
        }
        expect(validators.isValidBalance(balance)).toBe(false)
      })
      it('should be false if the balance includes at least one negative amont', () => {
        expect.assertions(1)
        const balance = {
          ether: '0.12',
          erc20: '-100',
        }
        expect(validators.isValidBalance(balance)).toBe(false)
      })
    })
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

      it('should fail when metadataInputs is present but invalid', () => {
        expect.assertions(1)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            metadataInputs: {},
          })
        ).toBeFalsy()
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

      it('icon is data URI', () => {
        expect.assertions(1)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTQiPg0KICA8cGF0aCBkPSJNMTEzLjMgMTguMmMwLTUuOC4xLTExLjIuNC0xNi4yTDk4LjQgNC45djEuNGwxLjUuMmMxLjEuMSAxLjguNSAyLjIgMS4xLjQuNy43IDEuNy45IDMuMi4yIDIuOS40IDkuNS4zIDE5LjkgMCAxMC4zLS4xIDE2LjgtLjMgMTkuMyA1LjUgMS4yIDkuOCAxLjcgMTMgMS43IDYgMCAxMC43LTEuNyAxNC4xLTUuMiAzLjQtMy40IDUuMi04LjIgNS4yLTE0LjEgMC00LjctMS4zLTguNi0zLjktMTEuNy0yLjYtMy4xLTUuOS00LjYtOS44LTQuNi0yLjYgMC01LjMuNy04LjMgMi4xem0uMyAzMC44Yy0uMi0zLjItLjQtMTIuOC0uNC0yOC41LjktLjMgMi4xLS41IDMuNi0uNSAyLjQgMCA0LjMgMS4yIDUuNyAzLjcgMS40IDIuNSAyLjEgNS41IDIuMSA5LjMgMCA0LjctLjggOC41LTIuNCAxMS43LTEuNiAzLjEtMy42IDQuNy02LjEgNC43LS44LS4yLTEuNi0uMy0yLjUtLjR6TTQxIDNIMXYybDIuMS4yYzEuNi4zIDIuNy45IDMuNCAxLjguNyAxIDEuMSAyLjYgMS4yIDQuOC44IDEwLjguOCAyMC45IDAgMzAuMi0uMiAyLjItLjYgMy44LTEuMiA0LjgtLjcgMS0xLjggMS42LTMuNCAxLjhsLTIuMS4zdjJoMjUuOHYtMmwtMi43LS4yYy0xLjYtLjItMi43LS45LTMuNC0xLjgtLjctMS0xLjEtMi42LTEuMi00LjgtLjMtNC0uNS04LjYtLjUtMTMuN2w1LjQuMWMyLjkuMSA0LjkgMi4zIDUuOSA2LjdoMlYxOC45aC0yYy0xIDQuMy0yLjkgNi41LTUuOSA2LjZsLTUuNC4xYzAtOSAuMi0xNS40LjUtMTkuM2g3LjljNS42IDAgOS40IDMuNiAxMS42IDEwLjhsMi40LS43TDQxIDN6bS00LjcgMzAuOGMwIDUuMiAxLjUgOS41IDQuNCAxMi45IDIuOSAzLjQgNy4yIDUgMTIuNiA1czkuOC0xLjcgMTMtNS4yYzMuMi0zLjQgNC43LTcuNyA0LjctMTIuOXMtMS41LTkuNS00LjQtMTIuOWMtMi45LTMuNC03LjItNS0xMi42LTVzLTkuOCAxLjctMTMgNS4yYy0zLjIgMy40LTQuNyA3LjctNC43IDEyLjl6bTIyLjMtMTEuNGMxLjIgMi45IDEuNyA2LjcgMS43IDExLjMgMCAxMC42LTIuMiAxNS44LTYuNSAxNS44LTIuMiAwLTMuOS0xLjUtNS4xLTQuNS0xLjItMy0xLjctNi44LTEuNy0xMS4zQzQ3IDIzLjIgNDkuMiAxOCA1My41IDE4YzIuMi0uMSAzLjkgMS40IDUuMSA0LjR6bTg0LjUgMjQuM2MzLjMgMy4zIDcuNSA1IDEyLjUgNSAzLjEgMCA1LjgtLjYgOC4yLTEuOSAyLjQtMS4yIDQuMy0yLjcgNS42LTQuNWwtMS0xLjJjLTIuMiAxLjctNC43IDIuNS03LjYgMi41LTQgMC03LjEtMS4zLTkuMi00LTIuMi0yLjctMy4yLTYuMS0zLTEwLjVIMTcwYzAtNC44LTEuMi04LjctMy43LTExLjgtMi41LTMtNi00LjUtMTAuNS00LjUtNS42IDAtOS45IDEuOC0xMyA1LjMtMy4xIDMuNS00LjYgNy44LTQuNiAxMi45IDAgNS4yIDEuNiA5LjQgNC45IDEyLjd6bTcuNC0yNS4xYzEuMS0yLjQgMi41LTMuNiA0LjQtMy42IDMgMCA0LjUgMy44IDQuNSAxMS41bC0xMC42LjJjLjEtMyAuNi01LjcgMS43LTguMXptNDYuNC00Yy0yLjctMS4yLTYuMS0xLjktMTAuMi0xLjktNC4yIDAtNy41IDEuMS0xMCAzLjJzLTMuOCA0LjctMy44IDcuOGMwIDIuNy44IDQuOCAyLjMgNi4zIDEuNSAxLjUgMy45IDIuOCA3IDMuOSAyLjggMSA0LjggMiA1LjggMi45IDEgMSAxLjYgMi4xIDEuNiAzLjYgMCAxLjQtLjUgMi43LTEuNiAzLjctMSAxLjEtMi40IDEuNi00LjIgMS42LTQuNCAwLTcuNy0zLjItMTAtOS42bC0xLjcuNS40IDEwYzMuNiAxLjQgNy42IDIuMSAxMiAyLjEgNC42IDAgOC4xLTEgMTAuNy0zLjEgMi42LTIgMy45LTQuOSAzLjktOC41IDAtMi40LS42LTQuNC0xLjktNS45LTEuMy0xLjUtMy40LTIuOC02LjQtNC0zLjMtMS4yLTUuNi0yLjMtNi44LTMuMy0xLjItMS0xLjgtMi4yLTEuOC0zLjdzLjQtMi43IDEuMy0zLjcgMi0xLjQgMy40LTEuNGM0IDAgNi45IDIuOSA4LjcgOC42bDEuNy0uNS0uNC04LjZ6bS05Ni4yLS45Yy0xLjQtLjctMi45LTEtNC42LTEtMS43IDAtMy40LjctNS4zIDIuMS0xLjkgMS40LTMuMyAzLjMtNC40IDUuOWwuMS04LTE1LjIgM3YxLjRsMS41LjFjMS45LjIgMyAxLjcgMy4yIDQuNC42IDYuMi42IDEyLjggMCAxOS44LS4yIDIuNy0xLjMgNC4xLTMuMiA0LjRsLTEuNS4ydjEuOWgyMS4yVjQ5bC0yLjctLjJjLTEuOS0uMi0zLTEuNy0zLjItNC40LS42LTUuOC0uNy0xMi0uMi0xOC40LjYtMSAxLjktMS42IDMuOS0xLjggMi0uMiA0LjMuNCA2LjcgMS44bDMuNy05LjN6Ij48L3BhdGg+DQo8L3N2Zz4=',
          })
        ).toBe(true)
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
                another: 6,
                time: 7,
              },
            })
          ).toBe(false)
        })

        it.each([noConfirmed, noPending, noExpired, noDefault])(
          'callToAction has unrecognized keys',
          (defaults) => {
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
          (key) => {
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

      it('icon is not a string', () => {
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

      it('icon is not a valid url but that does not throw', () => {
        expect.assertions(4)

        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: '"><script type="text/javascript>alert("XSS");</script><img src="http://example.com/img.jpg',
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'notaURL',
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: '/test.jpg',
          })
        ).toBe(true)
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            icon: 'gerbils://eat.poo/fancy.jpg',
          })
        ).toBe(true)
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

          const endsWithZ = `${lock.substring(0, lock.length - 1)}Z`
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

          const tooLong = `${lock}a`
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

      describe('persistentCheckout', () => {
        it("should accept or 'true' as value", () => {
          expect.assertions(2)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: true,
            })
          ).toBe(true)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: 'true',
            })
          ).toBe(true)
        })
        it("should accept false or 'false' as value", () => {
          expect.assertions(2)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: false,
            })
          ).toBe(true)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: 'false',
            })
          ).toBe(true)
        })

        it('should accept no value set', () => {
          expect.assertions(1)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
            })
          ).toBe(true)
        })

        it('should reject other types', () => {
          expect.assertions(4)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: '',
            })
          ).toBe(false)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: 3,
            })
          ).toBe(false)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: [],
            })
          ).toBe(false)

          expect(
            validators.isValidPaywallConfig({
              ...validConfig,
              persistentCheckout: {},
            })
          ).toBe(false)
        })
      })
    })

    describe('valid cases', () => {
      it('is valid config', () => {
        expect.assertions(9)

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
        expect(
          validators.isValidPaywallConfig({
            ...validConfig,
            locks: {
              [lock]: {},
            },
          })
        ).toBe(true)
      })
    })

    it('is valid when lock has no name', () => {
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
      ).toBe(true)
    })

    it('is valid when lock name is an empty string', () => {
      expect.assertions(1)

      expect(
        validators.isValidPaywallConfig({
          ...validConfig,
          locks: {
            [lock]: {
              name: '',
            },
          },
        })
      ).toBe(true)
    })

    it('is valid when metadataInputs is present and valid', () => {
      expect.assertions(1)

      const metadataInputs = [
        {
          name: 'Name',
          type: 'text',
          required: true,
        },
        {
          name: 'Birthday',
          type: 'date',
          required: false,
        },
      ]

      expect(
        validators.isValidPaywallConfig({
          ...validConfig,
          metadataInputs,
        })
      ).toBeTruthy()
    })
  })

  describe('isValidKey', () => {
    const validKey = {
      expiration: 1,
      transactions: [],
      status: 'none',
      confirmations: 0,
      owner: '0x1234567890123456789012345678901234567890',
      lock: '0x0987654321098765432109876543210987654321',
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

      it('should fail if lock is not a valid ethereum address', () => {
        expect.assertions(1)

        expect(
          validators.isValidKey({
            ...validKey,
            lock: '0xIamnot a valid ethereum address',
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
        ])('should accept "%s" as a valid status', (status) => {
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
        lock: '0x0987654321098765432109876543210987654321',
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
            keyPrice: '0.023.0',
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

      it('should fail on invalid lock currencyContractAddress', () => {
        expect.assertions(4)

        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress: 9,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress: undefined,
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress: [],
          })
        ).toBe(false)
        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress: {},
          })
        ).toBe(false)
      })
    })

    describe('valid locks', () => {
      it('should accept a basic valid lock', () => {
        expect.assertions(1)

        expect(validators.isValidLock(validLock)).toBe(true)
      })

      it('should accept a valid lock with optional fields', () => {
        expect.assertions(1)

        expect(
          validators.isValidLock({
            ...validLock,
            asOf: 1,
            maxNumberOfKeys: -1,
            outstandingKeys: 0,
            balance: '0',
            owner: '0x1234567890123456789012345678901234567890',
            publicLockVersion: 4,
            currencyContractAddress:
              '0x9876543210987654321098765432109876543210',
            some: 'random',
            fields: 'we do not know about',
          })
        ).toBe(true)
      })

      it('should accept valid currency contract address', () => {
        expect.assertions(2)

        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress:
              '0x9876543210987654321098765432109876543210',
          })
        ).toBe(true)
        expect(
          validators.isValidLock({
            ...validLock,
            currencyContractAddress: null,
          })
        ).toBe(true)
      })

      it('should accept valid key price', () => {
        expect.assertions(4)

        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: '0.1',
          })
        ).toBe(true)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: '.1',
          })
        ).toBe(true)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: '1',
          })
        ).toBe(true)
        expect(
          validators.isValidLock({
            ...validLock,
            keyPrice: '21.000',
          })
        ).toBe(true)
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
        lock: '0x0987654321098765432109876543210987654321',
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
      expect.assertions(2)

      expect(
        validators.isValidLocks({
          [validLock.address]: validLock,
          invalidLock,
        })
      ).toBe(false)
      expect(
        validators.isValidLocks({
          [validLock.address]: invalidLock,
          [validLock.address.replace('1', '2')]: invalidLock,
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
            lock: '0x098765432109876543210987654321098765432a',
            address,
          },
        })
      ).toBe(true)
    })
  })

  describe('isValidMetadataField', () => {
    const name = 'field name'
    const validType = 'date'
    const invalidType = 'genome-sequence'

    describe('failures', () => {
      it('should be false if the name is missing', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            type: validType,
            required: false,
          })
        ).toBeFalsy()
      })

      it('should be false if the name is not a string', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name: 7,
            type: validType,
            required: true,
          })
        ).toBeFalsy()
      })

      it('should be false if the type is missing', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name,
            required: true,
          })
        ).toBeFalsy()
      })

      it('should be false if the type is incorrect', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name,
            type: invalidType,
            required: true,
          })
        ).toBeFalsy()
      })

      it('should be false if the required property is missing', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name,
            type: validType,
          })
        ).toBeFalsy()
      })

      it('should be false if the required property is not a boolean', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name,
            type: validType,
            required: 7,
          })
        ).toBeFalsy()
      })
    })

    describe('successes', () => {
      it('should be true for a valid field input', () => {
        expect.assertions(1)

        expect(
          validators.isValidMetadataField({
            name,
            type: validType,
            required: true,
          })
        ).toBeTruthy()
      })
    })
  })

  describe('isValidMetadataArray', () => {
    describe('failures', () => {
      it('should be false if input is not an array', () => {
        expect.assertions(1)

        expect(validators.isValidMetadataArray(7)).toBeFalsy()
      })

      it('should be false if input contains invalid metadata fields', () => {
        expect.assertions(1)

        const fields = [
          {
            name: 'Jeff',
            type: 'person',
            required: 7,
          },
        ]

        expect(validators.isValidMetadataArray(fields)).toBeFalsy()
      })
    })

    describe('successes', () => {
      it('should be true if all fields are valid', () => {
        expect.assertions(1)

        const fields = [
          {
            name: 'Name',
            type: 'text',
            required: true,
          },
          {
            name: 'Email',
            type: 'email',
            required: true,
          },
          {
            name: 'Birthday',
            type: 'date',
            required: false,
          },
        ]

        expect(validators.isValidMetadataArray(fields)).toBeTruthy()
      })
    })
  })
})

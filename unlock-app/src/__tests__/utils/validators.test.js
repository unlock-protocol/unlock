import * as validators from '../../utils/validators'
import { vi, describe, beforeAll, expect, it } from 'vitest'

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
    expect.assertions(7)
    expect(validators.isPositiveInteger('1')).toBeTruthy()
    expect(
      validators.isPositiveInteger(
        '178941236598123465918347651983476519387456918736459813476598123645891765894765'
      )
    ).toBeTruthy()

    expect(validators.isPositiveInteger('-1')).toBeFalsy()
    expect(validators.isPositiveInteger('1.1')).toBeFalsy()
    expect(validators.isPositiveInteger('av')).toBeFalsy()
    expect(validators.isPositiveInteger(null)).toBeFalsy()
    expect(validators.isPositiveInteger(false)).toBeFalsy()
  })
  it('isLTE', () => {
    expect.assertions(6)
    const { isLTE } = validators
    const isLTEOneHundredYearsInDays = isLTE(36500)

    expect(isLTEOneHundredYearsInDays('-5')).toBeTruthy()
    expect(isLTEOneHundredYearsInDays('0')).toBeTruthy()
    expect(isLTEOneHundredYearsInDays(null)).toBeFalsy()
    expect(isLTEOneHundredYearsInDays(false)).toBeFalsy()
    expect(isLTEOneHundredYearsInDays('36500')).toBeTruthy()
    expect(isLTEOneHundredYearsInDays('36501')).toBeFalsy()
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
})

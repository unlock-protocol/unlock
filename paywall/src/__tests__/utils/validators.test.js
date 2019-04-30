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
})

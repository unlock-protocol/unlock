import {
  durationsAsTextFromSeconds,
  durations,
  secondsAsDays,
  expirationAsDate,
} from '../../utils/durations'

describe('durations', () => {
  it('should compute the right durations', () => {
    expect.assertions(10)
    expect(durations(0, {})).toEqual({})
    expect(durations(1, {})).toEqual({
      seconds: 1,
    })
    expect(durations(60, {})).toEqual({
      minutes: 1,
    })
    expect(durations(70, {})).toEqual({
      minutes: 1,
      seconds: 10,
    })
    expect(durations(60 * 60, {})).toEqual({
      hours: 1,
    })
    expect(durations(60 * 60 + 10, {})).toEqual({
      hours: 1,
      seconds: 10,
    })
    expect(durations(60 * 60 * 24, {})).toEqual({
      days: 1,
    })
    expect(durations(60 * 60 * 24 * 3, {})).toEqual({
      days: 3,
    })
    expect(durations(60 * 60 * 24 * 1000, {})).toEqual({
      days: 1000,
    })
    expect(
      durations(60 * 60 * 24 * 30 + 60 * 60 * 12 + 60 * 3 + 35, {})
    ).toEqual({
      days: 30,
      hours: 12,
      minutes: 3,
      seconds: 35,
    })
  })

  it('should return the right durations in English', () => {
    expect.assertions(6)
    expect(durationsAsTextFromSeconds(0)).toEqual('')
    expect(durationsAsTextFromSeconds(0.5)).toEqual('')
    expect(durationsAsTextFromSeconds(1)).toEqual('1 second')
    expect(durationsAsTextFromSeconds(123)).toEqual('2 minutes and 3 seconds')
    expect(durationsAsTextFromSeconds(60 * 60)).toEqual('1 hour')
    expect(
      durationsAsTextFromSeconds(
        60 * 60 * 24 * 265 + 60 * 60 * 27 + 60 * 58 + 8797
      )
    ).toEqual('266 days, 6 hours, 24 minutes and 37 seconds')
  })

  it('should return the correct number of days from a given number of seconds', () => {
    expect.assertions(5)
    expect(secondsAsDays(86400)).toEqual('1')
    expect(secondsAsDays(86399)).toEqual('1')
    expect(secondsAsDays(0)).toEqual('0')
    expect(secondsAsDays(172800)).toEqual('2')
    expect(secondsAsDays(172000)).toEqual('2')
  })

  describe('expirationAsDate', () => {
    it('should return expired for keys previously expired', () => {
      expect.assertions(1)
      const timestamp = Math.round(new Date().getTime() / 1000) - 60 * 60 // 1 hour ago
      expect(expirationAsDate(timestamp)).toEqual('Expired')
    })

    it('should return the correct timestamp if the date is far enough in the future', () => {
      expect.assertions(1)
      const dateToTest = 'Jul 7, 2022'
      const timestamp = Math.round(new Date(dateToTest).getTime() / 1000)
      expect(expirationAsDate(timestamp)).toEqual(dateToTest)
    })

    it('should return the elapsed time until the expiration if it is less than 1 day', () => {
      expect.assertions(1)
      const dateToTest = '12 hours, 35 minutes and 12 seconds'
      const timestamp =
        parseInt(new Date().getTime() / 1000) +
        12 * 60 * 60 + // 12 hours
        35 * 60 + // 35 minutes
        12 // 12 seconds
      expect(expirationAsDate(timestamp)).toEqual(dateToTest)
    })
  })
})

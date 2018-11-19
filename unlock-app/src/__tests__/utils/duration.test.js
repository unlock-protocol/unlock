import {
  durationsAsTextFromSeconds,
  durations,
  secondsAsDays,
  expirationAsDate,
} from '../../utils/durations'

describe('durations', () => {
  it('should compute the right durations', () => {
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
    expect(durationsAsTextFromSeconds(0)).toEqual('')
    expect(durationsAsTextFromSeconds(1)).toEqual('1 second')
    expect(durationsAsTextFromSeconds(0.5)).toEqual('0.5 seconds')
    expect(durationsAsTextFromSeconds(123)).toEqual('2 minutes and 3 seconds')
    expect(durationsAsTextFromSeconds(60 * 60)).toEqual('1 hour')
    expect(
      durationsAsTextFromSeconds(
        60 * 60 * 24 * 265 + 60 * 60 * 27 + 60 * 58 + 8797
      )
    ).toEqual('266 days, 6 hours, 24 minutes and 37 seconds')
  })

  it('should return the correct number of days from a given number of seconds', () => {
    expect(secondsAsDays(86400)).toEqual('1')
    expect(secondsAsDays(86399)).toEqual('1')
    expect(secondsAsDays(0)).toEqual('0')
    expect(secondsAsDays(172800)).toEqual('2')
    expect(secondsAsDays(172000)).toEqual('2')
  })

  it('should return the correct timestamp', () => {
    let dateToTest = 'Jul 7, 2022'
    let timestamp = Math.round(new Date(dateToTest).getTime() / 1000)
    expect(expirationAsDate(timestamp)).toEqual(dateToTest)
  })
})

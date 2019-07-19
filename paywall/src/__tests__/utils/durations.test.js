import {
  durationsAsTextFromSeconds,
  durationsAsArrayFromSeconds,
  expirationAsText,
  durations,
} from '../../utils/durations'

describe('duration utilities', () => {
  describe('durations', () => {
    it('should return an object with seconds set for < 1 minute', () => {
      expect.assertions(3)

      expect(durations(0.5, {})).toEqual({
        seconds: 0.5,
      })
      expect(durations(59, {})).toEqual({
        seconds: 59,
      })
      expect(durations(59.9, {})).toEqual({
        seconds: 59.9,
      })
    })

    it('should return an object with minutes set for > 1 minute, < 1 hour', () => {
      expect.assertions(3)

      expect(durations(60, {})).toEqual({
        minutes: 1,
      })
      expect(durations(61, {})).toEqual({
        seconds: 1,
        minutes: 1,
      })
      expect(durations(3599, {})).toEqual({
        minutes: 59,
        seconds: 59,
      })
    })

    it('should return an object with hours set for > 1 hour, < 1 day', () => {
      expect.assertions(3)

      expect(durations(3600, {})).toEqual({
        hours: 1,
      })
      expect(durations(3601, {})).toEqual({
        seconds: 1,
        hours: 1,
      })
      expect(durations(60 * 60 * 24 - 1, {})).toEqual({
        minutes: 59,
        seconds: 59,
        hours: 23,
      })
    })

    it('should return an object with days set for > 1 day', () => {
      expect.assertions(1)

      expect(durations(60 * 60 * 24 * 5, {})).toEqual({
        days: 5,
      })
    })
  })
  describe('durationsAsTextFromSeconds', () => {
    it('should return the right durations', () => {
      expect.assertions(3)
      expect(durationsAsTextFromSeconds(60 * 60 * 24)).toEqual('1 day')
      expect(durationsAsTextFromSeconds(60 * 60 * 24 * 3 + 60 * 45)).toEqual(
        '3 days and 45 minutes'
      )
      expect(
        durationsAsTextFromSeconds(60 * 60 * 24 * 3 + 60 * 60 * 12 + 60 * 30)
      ).toEqual('3 days, 12 hours and 30 minutes')
    })
  })

  describe('durationsAsArrayFromSeconds', () => {
    it('should return the right durations', () => {
      expect.assertions(7)
      expect(durationsAsArrayFromSeconds(60 * 60 * 24)).toEqual(['1 day'])
      expect(durationsAsArrayFromSeconds(60 * 60 * 24 * 3)).toEqual(['3 days'])
      expect(durationsAsArrayFromSeconds(60 * 60 * 12)).toEqual(['12 hours'])
      expect(durationsAsArrayFromSeconds(60 * 60 * 1)).toEqual(['1 hour'])
      expect(durationsAsArrayFromSeconds(60 * 30)).toEqual(['30 minutes'])
      expect(durationsAsArrayFromSeconds(60)).toEqual(['1 minute'])
      expect(
        durationsAsArrayFromSeconds(60 * 60 * 24 * 3 + 60 * 60 * 12 + 60 * 30)
      ).toEqual(['3 days', '12 hours', '30 minutes'])
    })

    it('should round down', () => {
      expect.assertions(3)
      expect(durationsAsArrayFromSeconds(60.45)).toEqual(['1 minute'])
      expect(durationsAsArrayFromSeconds(61.45)).toEqual([
        '1 minute',
        '1 second',
      ])
      expect(durationsAsArrayFromSeconds(62.88)).toEqual([
        '1 minute',
        '2 seconds',
      ])
    })
  })

  describe('expirationAsText', () => {
    function addMinutes(timestamp, minutes) {
      return timestamp + 60 * minutes
    }
    function addHours(timestamp, hours) {
      return timestamp + 3600 * hours
    }
    function addDays(timestamp, days) {
      return timestamp + 3600 * 24 * days
    }
    function getTimestamp({ minutes = 0, hours = 0, days = 0 }) {
      return addDays(
        addHours(addMinutes(new Date().getTime() / 1000, minutes), hours),
        days
      )
    }

    it('should return "never" for 0 timestamp', () => {
      expect.assertions(1)

      expect(expirationAsText(0)).toBe('Never Expires')
    })

    it('should return "Expired" for old timestamps', () => {
      expect.assertions(1)

      expect(expirationAsText(getTimestamp({ minutes: -1 }))).toBe('Expired')
    })

    it('should return "< 1 Minute" for expiration in seconds', () => {
      expect.assertions(1)

      expect(expirationAsText(getTimestamp({ seconds: 30 }))).toBe(
        'Expires in < 1 Minute'
      )
    })

    it('should return "1 Minute" for expiration between 1 minute and 2 minutes', () => {
      expect.assertions(2)

      expect(expirationAsText(getTimestamp({ minutes: 1, seconds: 0.5 }))).toBe(
        'Expires in 1 Minute'
      )

      expect(
        expirationAsText(getTimestamp({ minutes: 1, seconds: 59.9 }))
      ).toBe('Expires in 1 Minute')
    })

    it('should return "X Minutes" for expiration between 2 minutes and 30 minutes', () => {
      expect.assertions(2)

      expect(expirationAsText(getTimestamp({ minutes: 2, seconds: 0.5 }))).toBe(
        'Expires in 2 Minutes'
      )

      expect(
        expirationAsText(getTimestamp({ minutes: 29, seconds: 59.9 }))
      ).toBe('Expires in 29 Minutes')
    })

    it('should return "1 Hour" for expiration between 30 minutes and 1 hour, 30 minutes', () => {
      expect.assertions(2)

      expect(expirationAsText(getTimestamp({ minutes: 31 }))).toBe(
        'Expires in 1 Hour'
      )

      expect(expirationAsText(getTimestamp({ hours: 1, minutes: 29 }))).toBe(
        'Expires in 1 Hour'
      )
    })

    it('should round up if there are more than 30 minutes', () => {
      expect.assertions(2)

      expect(
        expirationAsText(getTimestamp({ minutes: 31, seconds: 0.5 }))
      ).toBe('Expires in 1 Hour')

      expect(expirationAsText(getTimestamp({ hours: 1, minutes: 31 }))).toBe(
        'Expires in 2 Hours'
      )
    })

    it('should return "X Hours" for expiration between 2 hours and 23 hours, 30 minutes', () => {
      expect.assertions(2)

      expect(expirationAsText(getTimestamp({ hours: 2, seconds: 0.5 }))).toBe(
        'Expires in 2 Hours'
      )

      expect(expirationAsText(getTimestamp({ hours: 23, minutes: 30 }))).toBe(
        'Expires in 23 Hours'
      )
    })

    it('should return "1 Day" for expiration between 23 hours, 31 minutes and 1 day, 23 hours, 30 minutes', () => {
      expect.assertions(2)

      expect(expirationAsText(getTimestamp({ hours: 23, minutes: 31 }))).toBe(
        'Expires in 1 Day'
      )

      expect(
        expirationAsText(getTimestamp({ days: 1, hours: 23, minutes: 29 }))
      ).toBe('Expires in 1 Day')
    })

    it('should return "X Days" for expiration between 1 day, 23 hours, 31 minutes and 29 days, 23 hours, 30 minutes', () => {
      expect.assertions(2)

      expect(
        expirationAsText(getTimestamp({ days: 1, hours: 23, minutes: 31 }))
      ).toBe('Expires in 2 Days')

      expect(
        expirationAsText(getTimestamp({ days: 30, hours: 23, minutes: 29 }))
      ).toBe('Expires in 30 Days')
    })

    it('should return "Blah 3, 1234" format for expiration between 29 days, 23 hours, 31 minutes and beyond', () => {
      expect.assertions(2)

      expect(
        expirationAsText(getTimestamp({ days: 30, hours: 23, minutes: 31 }))
      ).toMatch(/^Expires [a-zA-Z]+ \d+, \d{4}$/)

      expect(
        expirationAsText(getTimestamp({ days: 123, hours: 23, minutes: 31 }))
      ).toMatch(/^Expires [a-zA-Z]+ \d+, \d{4}$/)
    })
  })
})

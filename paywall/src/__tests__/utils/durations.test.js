import {
  durationsAsTextFromSeconds,
  durationsAsArrayFromSeconds,
  expirationAsText,
} from '../../utils/durations'

describe('duration utilities', () => {
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
    it('should return "Expires in ..." for small values', () => {
      expect.assertions(2)

      expect(
        expirationAsText(new Date().getTime() / 1000 + 60 * 60 * 12)
      ).toEqual('Expires in 12 hours')
      expect(
        expirationAsText(new Date().getTime() / 1000 + 60 * 60 * 12 + 60)
      ).toEqual('Expires in 12 hours and 1 minute')
    })

    it('should return "Expires ..." for large values', () => {
      expect.assertions(1)

      expect(expirationAsText(new Date('2100-01-01').getTime() / 1000)).toEqual(
        'Expires Dec 31, 2099'
      )
    })
  })
})

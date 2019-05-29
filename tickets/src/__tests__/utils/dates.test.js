import { getDaysMonthsAndYears, getTimeString } from '../../utils/dates'

describe('getDaysMonthsAndYears', () => {
  describe('years', () => {
    it('should show the new 3 years', () => {
      expect.assertions(1)
      const now = new Date('2019-04-09 10:30:00 GMT')
      const years = getDaysMonthsAndYears(now, 2019, 4)[2]
      expect(years).toEqual([2019, 2020, 2021])
    })

    it('should show the new 3 years even if the picked day is in the future', () => {
      expect.assertions(1)
      const now = new Date('2019-04-09 10:30:00 GMT')
      const years = getDaysMonthsAndYears(now, 2020, 4)[2]
      expect(years).toEqual([2019, 2020, 2021])
    })

    it('should show the new 3 years in the future', () => {
      expect.assertions(1)
      const now = new Date('2020-04-09 10:30:00 GMT')
      const years = getDaysMonthsAndYears(now, 2020, 4)[2]
      expect(years).toEqual([2020, 2021, 2022])
    })
  })

  describe('months', () => {
    it('should show only the remain months if the picked date is in the current year', () => {
      expect.assertions(1)
      const now = new Date('2019-10-09 10:30:00 GMT')
      const months = getDaysMonthsAndYears(now, 2019, 4)[1]
      expect(months).toEqual([10, 11, 12])
    })

    it('should show only the remain months including the current month', () => {
      expect.assertions(1)
      const now = new Date('2019-07-09 10:30:00 GMT')
      const months = getDaysMonthsAndYears(now, 2019, 4)[1]
      expect(months).toEqual([7, 8, 9, 10, 11, 12])
    })

    it('should show all 12 month if the picked date is in the future', () => {
      expect.assertions(1)
      const now = new Date('2020-07-09 10:30:00 GMT')
      const months = getDaysMonthsAndYears(now, 2019, 4)[1]
      expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    })
  })

  describe('days', () => {
    it('should show only the remaining days of the month if the picked date is in the current month', () => {
      expect.assertions(1)
      const now = new Date('2019-04-22 10:30:00 GMT')
      const days = getDaysMonthsAndYears(now, 2019, 4)[0]
      expect(days).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30])
    })

    it('should show all days of the month if the picked date is in the current month but next year', () => {
      expect.assertions(1)
      const now = new Date('2019-04-22 10:30:00 GMT')
      const days = getDaysMonthsAndYears(now, 2020, 4)[0]
      expect(days).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
      ])
    })

    it('should show have 31 days if the month is January, March, May, July, August, October or December', () => {
      expect.assertions(7)
      const now = new Date('2019-04-22 10:30:00 GMT')
      let days = getDaysMonthsAndYears(now, 2020, 1)[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 3)[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 5)[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 'July')[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 8)[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 10)[0]
      expect(days.length).toEqual(31)
      days = getDaysMonthsAndYears(now, 2020, 12)[0]
      expect(days.length).toEqual(31)
    })

    it('should show have 30 days if the month is April, June, September, or November', () => {
      expect.assertions(4)
      const now = new Date('2019-04-22 10:30:00 GMT')
      let days = getDaysMonthsAndYears(now, 2020, 4)[0]
      expect(days.length).toEqual(30)
      days = getDaysMonthsAndYears(now, 2020, 6)[0]
      expect(days.length).toEqual(30)
      days = getDaysMonthsAndYears(now, 2020, 9)[0]
      expect(days.length).toEqual(30)
      days = getDaysMonthsAndYears(now, 2020, 11)[0]
      expect(days.length).toEqual(30)
    })

    it('should show have 28 days if the month is February on a non leap year', () => {
      expect.assertions(2)
      let now = new Date('2019-04-22 10:30:00 GMT')
      let days = getDaysMonthsAndYears(now, 2019, 2)[0]
      expect(days.length).toEqual(28)

      now = new Date('2100-04-22 10:30:00 GMT')
      days = getDaysMonthsAndYears(now, 2100, 2)[0]
      expect(days.length).toEqual(28)
    })

    it('should show have 29 days if the month is February on a leap year', () => {
      expect.assertions(2)
      let now = new Date('2020-04-22 10:30:00 GMT')
      let days = getDaysMonthsAndYears(now, 2020, 2)[0]
      expect(days.length).toEqual(29)

      now = new Date('2000-04-22 10:30:00 GMT')
      days = getDaysMonthsAndYears(now, 2000, 2)[0]
      expect(days.length).toEqual(29)
    })
  })
})

describe('getTimeString', () => {
  it('should convert a morning time into a readable string', () => {
    expect.assertions(1)
    const now = new Date(2020, 4, 23, 6, 30)
    const timeString = getTimeString(now)
    expect(timeString).toEqual('6:30am')
  })

  it('should convert an evening time into a readable string', () => {
    expect.assertions(1)
    const now = new Date(2020, 4, 23, 18, 30)
    const timeString = getTimeString(now)
    expect(timeString).toEqual('6:30pm')
  })

  it('should convert a midnight time into a readable string', () => {
    expect.assertions(1)
    const now = new Date(2020, 4, 23, 0, 30)
    const timeString = getTimeString(now)
    expect(timeString).toEqual('12:30am')
  })
})

import { googleCalendarLinkBuilder } from '../../utils/links'

describe('googleCalendarLinkBuilder', () => {
  it('should build the right link for full day event', () => {
    expect.assertions(1)
    const link = googleCalendarLinkBuilder(
      'The party',
      'This is going to be a very cool party that you should attend',
      new Date(2019, 12, 26),
      null,
      'The office'
    )
    expect(link).toEqual(
      'https://calendar.google.com/calendar/r/eventedit?&text=The party&dates=20200126/20200127&details=This is going to be a very cool party that you should attend&location=The office&sf=true&output=xml'
    )
  })

  it('should build the right link with the right time for the event', () => {
    expect.assertions(1)
    const link = googleCalendarLinkBuilder(
      'The party',
      'This is going to be a very cool party that you should attend',
      new Date(2019, 4, 16, 10, 30, 0),
      60 * 60 * 3,
      'The office'
    )
    expect(link).toEqual(
      'https://calendar.google.com/calendar/r/eventedit?&text=The party&dates=20190516T103000/20190516T133000&details=This is going to be a very cool party that you should attend&location=The office&sf=true&output=xml'
    )
  })
})

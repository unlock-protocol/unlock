import { googleCalendarLinkBuilder } from '../../utils/links'

describe('googleCalendarLinkBuilder', () => {
  it('should build the right link', () => {
    expect.assertions(1)
    const link = googleCalendarLinkBuilder(
      'The party',
      'This is going to be a very cool party that you should attend',
      new Date(2019, 12, 26),
      'The office'
    )
    expect(link).toEqual(
      'https://calendar.google.com/calendar/r/eventedit?&text=The party&dates=20200126/20200127&details=This is going to be a very cool party that you should attend&location=The office&sf=true&output=xml'
    )
  })
})

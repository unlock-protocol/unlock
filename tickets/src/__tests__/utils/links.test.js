import { googleCalendarLinkBuilder } from '../../utils/links'

describe('googleCalendarLinkBuilder', () => {
  it('should build the right link for full day event', () => {
    expect.assertions(1)
    const link = googleCalendarLinkBuilder(
      'The party',
      'This is going to be a very cool party that you should attend',
      new Date(2019, 12, 26, 23, 30, 0),
      null,
      'The office'
    )
    expect(link).toEqual(
      'https://calendar.google.com/calendar/r/eventedit?&text=The%20party&dates=20200126T233000/20200127T003000&details=This%20is%20going%20to%20be%20a%20very%20cool%20party%20that%20you%20should%20attend&location=The%20office&sf=true&output=xml'
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
      'https://calendar.google.com/calendar/r/eventedit?&text=The%20party&dates=20190516T103000/20190516T133000&details=This%20is%20going%20to%20be%20a%20very%20cool%20party%20that%20you%20should%20attend&location=The%20office&sf=true&output=xml'
    )
  })

  it('should correctly encode special characters', () => {
    expect.assertions(1)
    const link = googleCalendarLinkBuilder(
      "Ben & Julien's party",
      'This is going to be a very cool party that you should attend',
      new Date(2019, 4, 16, 10, 30, 0),
      60 * 60 * 3,
      'Contact Ben & Julien'
    )
    expect(link).toEqual(
      "https://calendar.google.com/calendar/r/eventedit?&text=Ben%20%26%20Julien's%20party&dates=20190516T103000/20190516T133000&details=This%20is%20going%20to%20be%20a%20very%20cool%20party%20that%20you%20should%20attend&location=Contact%20Ben%20%26%20Julien&sf=true&output=xml"
    )
  })
})

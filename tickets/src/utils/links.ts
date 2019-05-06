const formatDateForCalendar = (date: Date) => {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  return [year, month, day].join('')
}

export function googleCalendarLinkBuilder(
  name: string,
  details: string,
  date: Date,
  location: string
) {
  const start = formatDateForCalendar(date)
  const end = new Date(date)
  end.setDate(date.getDate() + 1)

  let googleCalendarLink = `https://calendar.google.com/calendar/r/eventedit?`
  googleCalendarLink += `&text=${name}`
  googleCalendarLink += `&dates=${start}/${formatDateForCalendar(end)}`
  googleCalendarLink += `&details=${details}`
  googleCalendarLink += `&location=${location}`
  googleCalendarLink += `&sf=true&output=xml`
  return googleCalendarLink
}

export default {
  googleCalendarLinkBuilder,
}

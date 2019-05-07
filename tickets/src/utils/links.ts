const formatDateForCalendar = (date: Date, allDay: boolean) => {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  if (!allDay) {
    const hours = ('0' + date.getUTCHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const time = `T${hours}${minutes}00Z`
    return [year, month, day, time].join('')
  }
  return [year, month, day].join('')
}

export function googleCalendarLinkBuilder(
  name: string,
  details: string,
  date: Date,
  duration: number,
  location: string
) {
  const start = formatDateForCalendar(date, !duration)
  let end
  if (duration) {
    // Duration is in seconds
    end = formatDateForCalendar(
      new Date(new Date(date).getTime() + duration * 1000),
      false
    )
  } else {
    const endDate = new Date(date)
    endDate.setDate(date.getDate() + 1)
    end = formatDateForCalendar(endDate, true)
  }

  let googleCalendarLink = `https://calendar.google.com/calendar/r/eventedit?`
  googleCalendarLink += `&text=${name}`
  googleCalendarLink += `&dates=${start}/${end}`
  googleCalendarLink += `&details=${details}`
  googleCalendarLink += `&location=${location}`
  googleCalendarLink += `&sf=true&output=xml`
  return googleCalendarLink
}

export default {
  googleCalendarLinkBuilder,
}

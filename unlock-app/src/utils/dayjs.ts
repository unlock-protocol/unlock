import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relative from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relative)
dayjs.extend(duration)

export function getFormattedTimestamp(timestamp: Date) {
  return dayjs(timestamp).format('ddd D MMMM YYYY h:mma')
}

export default dayjs

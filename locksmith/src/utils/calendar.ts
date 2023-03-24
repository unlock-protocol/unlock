import dayjs from 'dayjs'
import { EventAttributes, createEvent } from 'ics'
import logger from '../logger'

export const createEventIcs = async ({
  title,
  description,
  startDate,
  endDate,
}: {
  title: string
  description: string
  startDate: Date | null
  endDate?: Date | null
}) => {
  let file: Buffer | undefined = undefined

  try {
    const start = dayjs(startDate)
    // fallback to 1 hour duration when endDate is not present
    const end = endDate ? dayjs(endDate) : dayjs(startDate).add(1, 'hour')

    const event: EventAttributes = {
      title,
      description,
      start: [
        start.year(),
        start.month() + 1,
        start.date(),
        start.hour(),
        start.minute(),
      ],
      end: [end.year(), end.month() + 1, end.date(), end.hour(), end.minute()],
    }

    const { error, value } = createEvent(event)

    if (error) {
      return undefined
    }

    file = Buffer.from(value as string, 'utf-8')

    return file
  } catch (err) {
    logger.info(err)
  }

  return file
}

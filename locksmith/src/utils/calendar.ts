import dayjs from 'dayjs'
import { EventAttributes, createEvent } from 'ics'

export const createEventIcs = async ({
  title,
  description,
  startDate,
}: {
  title: string
  description: string
  startDate: Date | string
}) => {
  const filename = `${title?.concat('_')}.ics`

  const start = dayjs(startDate)

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
    // todo: replace with endDate
    duration: { hours: 1 },
  }

  const file = await new Promise((resolve, reject) => {
    createEvent(event, (error: any, value: string) => {
      if (error) {
        reject(error)
      }

      resolve(new File([value], filename, { type: 'plain/text' }))
    })
  })

  return file
}

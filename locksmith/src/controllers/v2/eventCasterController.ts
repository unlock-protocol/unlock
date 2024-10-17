import { Response } from 'express'

// This is the API endpoint used by EventCaster to create events

export const createEvent = (req: Request, res: Response) => {
  // We should cerate the corresponding Unlock Event (why not?)
  // We should deploy the lock!
  return res.json({ message: 'Event created!' })
}

export const rsvpForEvent = (req: Request, res: Response) => {
  // Given the event let's get the lock address from eventCaster
  // And mint!
  return res.json({ message: 'Event RSVP!' })
}

import { Metadata } from '~/components/interface/locks/metadata/utils'

export const getEventDate = (metadata: Partial<Metadata>): Date | null => {
  if (metadata.ticket.event_start_date) {
    return new Date(Date.parse(metadata.ticket.event_start_date.toString()))
  }
  return null
}

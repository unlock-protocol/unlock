export interface Ticket {
  event_start_date?: string
  event_start_time?: string
  event_address?: string
  event_meeting_url?: string
}
export interface MetadataFormData {
  name: string
  description?: string
  external_url?: string
  youtube_url?: string
  animation_url?: string
  background_color?: string
  ticket: Ticket
  properties: Attribute[]
  levels: Attribute[]
  stats: Attribute[]
  [key: string]: any
}

export interface Attribute {
  display_type?: string
  max_value?: number
  trait_type: string
  value: string | number
}

export interface Metadata {
  name: string
  image?: string
  description?: string
  external_url?: string
  youtube_url?: string
  animation_url?: string
  background_color?: string
  attributes?: Attribute[]
  [key: string]: any
}

export function toFormData({
  name,
  description,
  attributes,
  animation_url,
  external_url,
  youtube_url,
  background_color,
}: Metadata) {
  const ticket = attributes
    ?.filter((item) => item.trait_type.startsWith('event_'))
    .reduce((item, { trait_type, value }) => {
      item[trait_type as keyof Ticket] = value as string
      return item
    }, {} as Ticket)

  const stats = attributes?.filter(
    (item) => item.display_type === 'number' && typeof item.value === 'number'
  )
  const levels = attributes?.filter(
    (item) => typeof item.value === 'number' && !item.display_type
  )
  const properties = attributes?.filter(
    (item) =>
      typeof item.value === 'string' &&
      !item.max_value &&
      !item.trait_type.startsWith('event_')
  )
  return {
    name,
    description,
    background_color,
    animation_url,
    external_url,
    youtube_url,
    ticket,
    levels,
    properties,
    stats,
  } as MetadataFormData
}

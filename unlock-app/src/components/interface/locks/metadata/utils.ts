export interface Ticket {
  event_start_date?: string
  event_start_time?: string
  event_address?: string
  event_url?: string
}
export interface MetadataFormData {
  name: string
  image?: string
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
  attributes: Attribute[]
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
  image,
}: Partial<Metadata>) {
  const categorizedAttrs = categorizeAttributes(attributes || [])
  const metadata = {
    ...categorizedAttrs,
  } as MetadataFormData

  if (name) {
    metadata.name = name
  }

  if (description) {
    metadata.description = description
  }

  if (animation_url) {
    metadata.animation_url = animation_url
  }

  if (external_url) {
    metadata.external_url = external_url
  }

  if (youtube_url) {
    metadata.youtube_url = youtube_url
  }

  if (image) {
    metadata.image = image
  }

  if (background_color) {
    metadata.background_color = background_color.startsWith('#')
      ? `#${background_color}`
      : background_color
  }

  return metadata
}

export const categorizeAttributes = (
  attributes: Attribute[] | undefined = []
) => {
  if (!attributes) {
    return {}
  }

  const ticket = attributes.reduce((item, { trait_type, value }) => {
    item[trait_type as keyof Ticket] = value as string
    return item
  }, {} as Ticket)

  const stats = attributes.filter(
    (item) => item.display_type === 'number' && typeof item.value === 'number'
  )
  const levels = attributes.filter(
    (item) => typeof item.value === 'number' && !item.display_type
  )
  const properties = attributes.filter(
    (item) =>
      typeof item.value === 'string' &&
      !item.max_value &&
      !item.trait_type.startsWith('event_')
  )

  return {
    ticket,
    levels,
    properties,
    stats,
  }
}

export const formDataToMetadata = ({
  name,
  description,
  animation_url,
  youtube_url,
  external_url,
  background_color,
  ticket,
  properties,
  levels,
  stats,
  image,
}: MetadataFormData) => {
  const metadata: Metadata & { attributes: Attribute[] } = {
    name,
    image,
    attributes: [] as Attribute[],
  }

  if (ticket?.event_start_date) {
    metadata.attributes.push({
      trait_type: 'event_start_date',
      value: ticket.event_start_date,
    })
  }

  if (ticket?.event_start_time) {
    metadata.attributes.push({
      trait_type: 'event_start_time',
      value: ticket.event_start_time,
    })
  }

  if (ticket?.event_address) {
    metadata.attributes.push({
      trait_type: 'event_address',
      value: ticket.event_address,
    })
  }

  if (ticket?.event_url) {
    metadata.attributes.push({
      trait_type: 'event_url',
      value: ticket.event_url,
    })
  }

  const propertyAttributes = properties?.filter(
    (item) => item.trait_type && item.value
  )

  const levelsAttributes = levels?.filter(
    (item) => item.trait_type && item.value && item.max_value
  )
  const statsAttributes = stats?.filter(
    (item) => item.trait_type && item.value && item.max_value
  )

  if (propertyAttributes?.length) {
    metadata.attributes.push(...propertyAttributes)
  }

  if (levelsAttributes?.length) {
    metadata.attributes.push(...levelsAttributes)
  }

  if (statsAttributes?.length) {
    metadata.attributes.push(...statsAttributes)
  }

  // Opensea does not handle # in the color. We remove it if it's included in the color.
  if (background_color && background_color.length === 7) {
    metadata.background_color = background_color?.trim()?.replace('#', '')
  }

  if (description) {
    metadata.description = description
  }

  if (youtube_url) {
    metadata.youtube_url = youtube_url
  }

  if (animation_url) {
    metadata.animation_url = animation_url
  }

  if (external_url) {
    metadata.external_url = external_url
  }
  return metadata
}

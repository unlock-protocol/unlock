export interface LockMetadataFormData {
  name: string
  external_url?: string
  youtube_url?: string
  animation_url?: string
  background_color?: string
  ticket: {
    event_date?: string
    event_time?: string
    event_address?: string
    meeting_url?: string
  }
  properties: Record<'type' | 'name', string>[]
  levels: {
    type: string
    value: number
    maxValue: number
  }[]
  stats: {
    type: string
    value: number
    maxValue: number
  }[]
}

export interface Attribute {
  display_type?: string
  max_value?: number
  trait_type: string
  value: string | number
}

export function toFormData() {}

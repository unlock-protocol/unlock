import { describe, expect, it } from 'vitest'
import {
  getMyEventsTabClassName,
  myEventsTabListAriaLabel,
  myEventsTabs,
} from '../../utils/myEventsTabs'

describe('myEventsTabs', () => {
  it('keeps events and collections as separate first-class tabs', () => {
    expect(myEventsTabListAriaLabel).toBe('Event sections')
    expect(myEventsTabs).toEqual([
      {
        id: 'events',
        label: 'My events',
      },
      {
        id: 'collections',
        label: 'My event collections',
      },
    ])
  })

  it('marks the selected tab and keeps keyboard focus styling', () => {
    expect(getMyEventsTabClassName({ selected: true })).toContain(
      'border-brand-ui-primary text-brand-ui-primary'
    )
    expect(getMyEventsTabClassName({ selected: true })).toContain(
      'focus-visible:ring-2'
    )

    expect(getMyEventsTabClassName({ selected: false })).toContain(
      'border-transparent text-gray-700 hover:text-brand-ui-primary'
    )
  })
})

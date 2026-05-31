export const myEventsTabListAriaLabel = 'Event sections'

export const myEventsTabs = [
  {
    id: 'events',
    label: 'My events',
  },
  {
    id: 'collections',
    label: 'My event collections',
  },
] as const

export const getMyEventsTabClassName = ({
  selected,
}: {
  selected: boolean
}) => {
  return [
    'flex items-center gap-2 px-4 py-3 text-base font-semibold border-b-2 rounded-t-md outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-brand-ui-primary focus-visible:ring-offset-2',
    selected
      ? 'border-brand-ui-primary text-brand-ui-primary'
      : 'border-transparent text-gray-700 hover:text-brand-ui-primary',
  ].join(' ')
}

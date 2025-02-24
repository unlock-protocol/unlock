import { Button } from '@unlock-protocol/ui'
import { useCallback } from 'react'
import { FilterProps } from '~/components/interface/locks/Manage/elements/Members'
import { useSelection } from './SelectionContext'

export const AttendeesActionsWrapper = ({
  toggleAll,
  bulkApprove,
  bulkDeny,
  allSelected,
}: {
  toggleAll: (keys: any) => void
  bulkApprove: (keys: any) => void
  bulkDeny: (keys: any) => void
  allSelected: boolean
}) => {
  const { selected } = useSelection()
  const numberOfSelected = Object.values(selected).filter(Boolean).length

  const AttendeesActions = ({
    keys,
    filters,
  }: {
    keys: any
    filters: FilterProps
  }) => {
    const toggle = useCallback(() => {
      toggleAll(keys)
    }, [keys])

    if (keys.length <= 1) {
      return null
    }

    if (!filters || ['pending', 'denied'].indexOf(filters.approval) === -1) {
      return null
    }

    return (
      <div className="flex gap-2">
        <Button onClick={toggle} variant="secondary" size="small">
          {allSelected ? 'Unselect all' : 'Select all'}
        </Button>

        {numberOfSelected > 1 && (
          <>
            <Button
              onClick={() => bulkApprove(keys)}
              disabled={numberOfSelected === 0}
              variant="secondary"
              size="small"
            >
              Approve {numberOfSelected}
            </Button>
            <Button
              onClick={() => bulkDeny(keys)}
              disabled={numberOfSelected === 0}
              variant="secondary"
              size="small"
            >
              Deny {numberOfSelected}
            </Button>
          </>
        )}
      </div>
    )
  }
  return AttendeesActions
}

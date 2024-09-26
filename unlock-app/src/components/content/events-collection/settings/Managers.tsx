import { SettingCard } from '~/components/interface/locks/Settings/elements/SettingCard'
import { CollectionManagerForm } from './ManagerForm'
import { EventCollection } from '@unlock-protocol/unlock-js'
import { Placeholder } from '@unlock-protocol/ui'

interface CollectionManagersProps {
  eventCollection: EventCollection
}

export const Managers = ({ eventCollection }: CollectionManagersProps) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label="Collection Managers"
        description="Add or remove managers to/from your event collection."
      >
        {!eventCollection && (
          <Placeholder.Root>
            <Placeholder.Card />
          </Placeholder.Root>
        )}
        {eventCollection && (
          <CollectionManagerForm
            eventCollection={eventCollection!}
            isManager={true}
            disabled={false}
          />
        )}
      </SettingCard>
    </div>
  )
}

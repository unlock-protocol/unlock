import dayjs from 'dayjs'
import { useState } from 'react'
import { locksmith } from '~/config/locksmith'

export const Hooks = ({
  hooks,
  refetch,
}: {
  hooks: any[]
  refetch: () => void
}) => {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const deleteNotification = async (id: string) => {
    setRemovingId(id)
    setTimeout(async () => {
      await locksmith.updateCheckoutHookJob(id)
      refetch()
    }, 300)
  }

  return (
    <div>
      <h4 className="font-medium">Hooks</h4>
      {hooks.map((hook: any) => {
        const { status, event } = hook.payload
        const isPending = status === 'pending'
        const text = isPending
          ? `could not send ${event} event data`
          : `sent ${event} event data successfully`
        return (
          <div
            onClick={() => deleteNotification(hook.id)}
            key={hook.id}
            className={`bg-white p-4 rounded-2xl text-sm border-2 my-2 transition-all duration-300 ease-in-out cursor-pointer
              outline outline-1 ${isPending ? 'outline-red-300' : 'outline-green-300'}
              hover:outline-[4px]
              ${removingId === hook.id ? 'opacity-0' : 'opacity-100'}`}
          >
            <p>{text}</p>
            <p className="font-semibold text-xs mt-4">
              {dayjs(hook.createdAt).format('D MMMM YYYY - HH:mm')}
            </p>
          </div>
        )
      })}
    </div>
  )
}

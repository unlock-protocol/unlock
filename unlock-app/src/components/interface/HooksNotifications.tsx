import dayjs from 'dayjs'

export const Hooks = ({ hooks, setHooks }: any) => {
  const deleteHook = (id: string) => {
    const updatedHooks = hooks.filter((hook: any) => hook.id !== id)
    setHooks(updatedHooks)
    localStorage.setItem('hooks', JSON.stringify(updatedHooks))
  }

  return (
    <div>
      {hooks.map((hook: any, i: number) => {
        return (
          <div
            onClick={() => deleteHook(hook.id)}
            className={`p-4 rounded-2xl text-sm border-2 hover:border-4 ${hook.success ? 'border-green-300' : 'border-red-300'} my-2`}
            key={i}
          >
            <p>{hook.text}</p>
            <p className="font-semibold text-xs mt-4">
              {dayjs(hook.created).format('D MMMM YYYY - HH:mm')}
            </p>
          </div>
        )
      })}
    </div>
  )
}

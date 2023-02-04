import { AppLayout } from '~/components/interface/layouts/AppLayout'

export const NewEvent = () => {
  return (
    <AppLayout showLinks={false} authRequired={true} title="Create New Event">
      <p>Cool!</p>
    </AppLayout>
  )
}

export default NewEvent

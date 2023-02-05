import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Form } from './Form'

export const NewEvent = () => {
  return (
    <AppLayout showLinks={false} authRequired={true} title="Create a new event">
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        <Form />
      </div>
    </AppLayout>
  )
}

export default NewEvent

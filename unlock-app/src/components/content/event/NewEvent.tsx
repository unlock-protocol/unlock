import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { Form } from './Form'

export const NewEvent = () => {
  const onSubmit = (formData: MetadataFormData) => {
    console.log(formData)
    // prompt the user to change network if applicable
    // Deploy the lock! and show the "waiting" screen + mention to *not* close!
    // Save metadata
  }

  return (
    <AppLayout
      showLinks={false}
      authRequired={true}
      title="Create a new event"
      description="Starting your event in a few minutes! Complete the following form and click the button to deploy your contract!"
    >
      <div className="grid max-w-3xl gap-6 pb-24 mx-auto">
        <Form onSubmit={onSubmit} />
      </div>
    </AppLayout>
  )
}

export default NewEvent

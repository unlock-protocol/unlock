import { useRouter } from 'next/router'
import { CreateLockForm } from '../Create/elements/CreateLockForm'

export const Deploy: React.FC = () => {
  const { query } = useRouter()
  console.log(query)
  // TODO: check if the user has already deployed a membership thru p00ls. (How do we identify it?)
  // If not, let them deploy one. We should use the chain, and address from the query to deploy the membership.
  // Once deployed, created a checkout URL for them an invite them to share it.
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex-col hidden mx-auto md:flex md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">
            Deploy your membership contract
          </h4>
          <span className="text-xl font-normal">
            For creative communities and the humans who build them.
          </span>
          <img
            className="mt-9"
            src="/images/svg/create-lock/members.svg"
            alt="Create lock members"
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockForm
            onSubmit={console.log}
            hideFields={['network', 'currency', 'quantity']}
            defaultValues={{
              currencyContractAddress: query.address?.toString(),
              name: 'Membership',
              unlimitedQuantity: true,
              unlimitedDuration: false,
              isFree: false,
              network: parseInt(query.network?.toString() || 137, 10),
            }}
          />
        </div>
      </div>
    </div>

    // <div>
    //   <p>Create an NFT Membership priced in $TOKEN NAME!</p>
    //   <p>Name</p>
    //   <p>Duration</p>
    //   <p>Price</p>
    //   <Button>Next</Button>
    // </div>
  )
}

export default Deploy

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { CheckoutHead } from '~/components/interface/checkout/Shell'
import { EnterCode } from '~/components/interface/connect/EnterCode'

const SignInPage = () => {
  const { data: session, status } = useSession()

  const router = useRouter()

  const { email } = router.query

  const callbackUrl = '/email'

  useEffect(() => {
    if (session) window.close()
  }, [session, status])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        left: 0,
        top: 0,
        background: 'white',
      }}
    >
      <div className="flex items-center justify-between w-full gap-2 p-2 px-6 border-b">
        <div className="flex items-center gap-1.5">
          <CheckoutHead />
        </div>
      </div>
      <div className="w-full gap-2 p-2 px-6 mt-4">
        <EnterCode
          email={email as string}
          callbackUrl={callbackUrl as string}
        />
      </div>
    </div>
  )
}

export default SignInPage

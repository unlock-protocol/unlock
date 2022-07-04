import { useActor } from '@xstate/react'
import useAccount from '~/hooks/useAccount'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import UnlockProvider from '~/services/unlockProvider'
import { useConfig } from '~/utils/withConfig'
import { EnterEmail } from './EnterEmail'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import { UnlockAccountService, UserDetails } from './unlockAccountMachine'

interface Props {
  unlockAccountService: UnlockAccountService
  injectedProvider: unknown
}

export function UnlockAccount({
  unlockAccountService,
  injectedProvider,
}: Props) {
  const config = useConfig()
  const [state] = useActor(unlockAccountService)
  const { retrieveUserAccount, createUserAccount } = useAccount('', 1)
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })

  const signIn = async ({ email, password }: UserDetails) => {
    const unlockProvider = await retrieveUserAccount(email, password)
    await authenticateWithProvider('UNLOCK', unlockProvider)
  }

  const signUp = async ({ email, password }: UserDetails) => {
    const { passwordEncryptedPrivateKey } = await createUserAccount(
      email,
      password
    )
    const unlockProvider = new UnlockProvider(config.networks[1])
    await unlockProvider.connect({
      key: passwordEncryptedPrivateKey,
      emailAddress: email,
      password,
    })
    await authenticateWithProvider('UNLOCK', unlockProvider)
  }

  switch (state.value) {
    case 'ENTER_EMAIL': {
      return <EnterEmail unlockAccountService={unlockAccountService} />
    }

    case 'SIGN_IN': {
      return (
        <SignIn unlockAccountService={unlockAccountService} signIn={signIn} />
      )
    }

    case 'SIGN_UP': {
      return (
        <SignUp unlockAccountService={unlockAccountService} signUp={signUp} />
      )
    }
    default: {
      return null
    }
  }
}

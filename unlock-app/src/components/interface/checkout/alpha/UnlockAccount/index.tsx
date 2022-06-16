import useAccount from '~/hooks/useAccount'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import UnlockProvider from '~/services/unlockProvider'
import { useConfig } from '~/utils/withConfig'
import { EnterEmail } from './EnterEmail'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'
import {
  UnlockAccountSend,
  UnlockAccountState,
  UserDetails,
} from './unlockAccountMachine'

interface Props {
  send: UnlockAccountSend
  state: UnlockAccountState
  injectedProvider: unknown
}

export function UnlockAccount({ send, state, injectedProvider }: Props) {
  const config = useConfig()
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
      return <EnterEmail send={send} state={state} />
    }

    case 'SIGN_IN': {
      return <SignIn send={send} state={state} signIn={signIn} />
    }

    case 'SIGN_UP': {
      return <SignUp send={send} state={state} signUp={signUp} />
    }
    default: {
      return null
    }
  }
}

import { getAccountFromPrivateKey } from '~/utils/accounts'

export const SignInWithPassword = ({ setWalletPk }) => {
  const [password, setPassword] = useState<string>('')

  const handleSignIn = async () => {
    if (!password) {
      ToastHelper.error('Password is required')
      throw new Error('Password is required')
    }
    try {
      const response = await locksmith.getUserPrivateKey(userEmail)
      const wallet = await getAccountFromPrivateKey(
        response!.data!.passwordEncryptedPrivateKey!,
        password
      )
      setWalletPk(wallet.privateKey)
    } catch (error) {
      console.error('Sign in error:', error)
      ToastHelper.error('Sign in failed. Please check your credentials.')
      throw error
    }
  }

  return <>Sign in with Password</>
}

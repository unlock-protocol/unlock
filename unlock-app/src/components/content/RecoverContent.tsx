import queryString from 'query-string'
import { connect } from 'react-redux'
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import { Heading, Instructions, Label } from '../interface/FinishSignup'
import { SetPassword, Credentials } from '../interface/SetPassword'
import { Router, Account } from '../../unlockTypes'
import { changePassword } from '../../actions/user'
import Loading from '../interface/Loading'

interface Props {
  account?: Account
  emailAddress?: string
  recoveryPhrase?: string
  changePassword: (credentials: Credentials, password: string) => any
}
interface StoreState {
  router: Router
  account?: Account
  recoveryPhrase: string
}

export const RecoverContent = ({
  account,
  emailAddress,
  changePassword,
  recoveryPhrase,
}: Props) => {
  let form

  let instructions = (
    <div>
      <Heading>Recover your Unlock Account</Heading>
      <Instructions>Please, set a new password for your account.</Instructions>
      <Label htmlFor="emailPlaceholder">Email</Label>
      <p>{emailAddress}</p>
    </div>
  )

  if (!emailAddress) {
    // If there is no email, we will not be able to retrieve the recoveryPhrase
    instructions = (
      <div>
        <Heading>Recover your Unlock Account</Heading>
        <Instructions>
          Your recovery link is not valid. Please try again.
        </Instructions>
      </div>
    )
  } else if (!account) {
    // If there is no account, then, we are probably trying to decrypt the key
    // TODO: what if decrypting the key fails?
    form = (
      <div>
        <Loading />
        <p>Checking your recovery key... This may take a couple seconds.</p>
      </div>
    )
  } else if (!recoveryPhrase) {
    // The recovery phrase is unset after the password is reset, so if the recovery phrase is unset, but the account is set, then it means we have succefully changed the password!
    form = (
      <div>
        <p>Your password was changed!</p>
      </div>
    )
  } else {
    form = (
      <SetPassword
        buttonLabel="Resetting password"
        emailAddress={emailAddress}
        onSubmit={credentials => changePassword(credentials, recoveryPhrase)}
      />
    )
  }

  return (
    <Layout title="Recover">
      <Head>
        <title>{pageTitle('Recover')}</title>
      </Head>
      {instructions}
      <Errors />
      {form}
    </Layout>
  )
}

export const mapDispatchToProps = (dispatch: any) => ({
  changePassword: (credentials: Credentials, recoveryPhrase: string) => {
    return dispatch(
      changePassword(
        recoveryPhrase, // oldPassword
        credentials.password // newPassword
      )
    )
  },
})

export const mapStateToProps = ({
  router,
  account,
  recoveryPhrase,
}: StoreState) => {
  const query = queryString.parse(router.location.search)
  let emailAddress = ''
  if (query) {
    if (query.email) {
      if (typeof query.email === 'string') {
        emailAddress = query.email
      } else if (Array.isArray(query.email)) {
        emailAddress = query.email[0]
      }
    }
  }

  return {
    emailAddress,
    account,
    recoveryPhrase,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecoverContent)

import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import QRCode from 'qrcode.react'
import Layout from '../interface/Layout'
import LogInSignUp from '../interface/LogInSignUp'
import { pageTitle } from '../../constants'
import { signData } from '../../actions/signature'

interface IdentityContentProps {
  accountAddress?: string
  signature: {
    data: string
    signature: string
  } | null
  signData: (dataToSign: any) => void
}

export class IdentityContent extends React.Component<IdentityContentProps> {
  constructor(props: IdentityContentProps) {
    super(props)
  }

  getSignature = () => {
    const { accountAddress, signData } = this.props
    const currentTime = Date.now()

    const stringifiedData = JSON.stringify({
      accountAddress,
      currentTime,
    })

    signData(stringifiedData)
  }

  render = () => {
    const { accountAddress, signature } = this.props
    return (
      <Layout title="Identity">
        <Head>
          <title>{pageTitle('Identity')}</title>
        </Head>
        {!accountAddress && <LogInSignUp login />}
        {signature && (
          <QRCode
            data-testid="identity-signature-QR-code"
            value={JSON.stringify(signature)}
            renderAs="svg"
          />
        )}
        {accountAddress && (
          <button onClick={this.getSignature} type="button">
            Click here to sign
          </button>
        )}
      </Layout>
    )
  }
}

interface ReduxState {
  account?: {
    address?: string
  }
  signature: {
    data: string
    signature: string
  } | null
}

export const mapDispatchToProps = (dispatch: any) => ({
  signData: (dataToSign: any) => dispatch(signData(dataToSign)),
})

export const mapStateToProps = (state: ReduxState) => {
  let accountAddress: string | undefined = undefined
  const { account, signature } = state
  if (account && account.address) {
    accountAddress = account.address
  }

  return {
    accountAddress,
    signature,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IdentityContent)

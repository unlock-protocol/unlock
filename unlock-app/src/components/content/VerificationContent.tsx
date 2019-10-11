import React from 'react'
import Head from 'next/head'
import QRScanner from '../interface/QRScanner'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import BrowserOnly from '../helpers/BrowserOnly'

export class VerificationContent extends React.Component {
  constructor(props: any) {
    super(props)
  }

  handleDecode = (result: string) => {
    alert(result)
  }

  render = () => {
    return (
      <Layout title="Verify Identity">
        <Head>
          <title>{pageTitle('Verify Identity')}</title>
        </Head>
        <BrowserOnly>
          <QRScanner onDecode={this.handleDecode} />
        </BrowserOnly>
      </Layout>
    )
  }
}

export default VerificationContent

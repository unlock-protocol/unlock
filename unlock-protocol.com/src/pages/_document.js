/* eslint react/no-danger: 0 */

import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import Fonts from '../theme/fonts'
import { globalStyle } from '../theme/globalStyle'

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet()
    const page = renderPage((App) => (props) =>
      sheet.collectStyles(<App {...props} />)
    )
    const styleTags = sheet.getStyleElement()
    const unlockTag = {
      __html: `
      (function(d, s) {
        var js = d.createElement(s),
        sc = d.getElementsByTagName(s)[0];
        js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
        sc.parentNode.insertBefore(js, sc); }(document, "script"))`,
    }
    const unlockConfigTag = {
      __html: `
      var unlockProtocolConfig = {
        network: 1,
        locks: {
          '0xB0114bbDCe17e0AF91b2Be32916a1e236cf6034F': {
            name: 'Unlock Community Members',
          }
        },
        icon: 'https://unlock-protocol.com/static/images/svg/unlock-word-mark.svg',
        callToAction: {
          default:
            'Unlock lets you easily offer paid memberships to your website or application. On this website, members can leave comments and participate in discussion. It is free to try! Just click "purchase" below.',
        },
      }`,
    }
    return { ...page, styleTags, unlockTag, unlockConfigTag }
  }

  render() {
    return (
      <html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Fonts />
          {/* TODO remove line below when https://github.com/styled-components/styled-components/issues/2962 has been fixed */}
          <style>{globalStyle}</style>

          <link rel="shortcut icon" href="/static/favicon.ico" />
          {this.props.styleTags}
          <script dangerouslySetInnerHTML={this.props.unlockTag} />
          <script dangerouslySetInnerHTML={this.props.unlockConfigTag} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

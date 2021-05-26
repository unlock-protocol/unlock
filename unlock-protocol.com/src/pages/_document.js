/* eslint react/no-danger: 0 */

import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import Fonts from '../theme/fonts'
import { globalStyle } from '../theme/globalStyle'
import paywallConfig from '../paywallConfig'

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
      var unlockProtocolConfig = ${JSON.stringify(paywallConfig)}`,
    }
    return { ...page, styleTags, unlockTag, unlockConfigTag }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <Fonts />
          {/* TODO remove line below when https://github.com/styled-components/styled-components/issues/2962 has been fixed */}
          <style>{globalStyle}</style>
          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/styles/default.min.css"
          />

          <link rel="shortcut icon" href="/static/favicon.ico" />
          {this.props.styleTags}
          <script dangerouslySetInnerHTML={this.props.unlockTag} />
          <script dangerouslySetInnerHTML={this.props.unlockConfigTag} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
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
    return { ...page, styleTags }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <Fonts />
          {/* TODO remove line below when https://github.com/styled-components/styled-components/issues/2962 has been fixed */}
          <style>{globalStyle}</style>
          <link rel="shortcut icon" href="/static/favicon.ico" />
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

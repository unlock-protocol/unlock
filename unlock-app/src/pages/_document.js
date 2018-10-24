import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static getInitialProps ({ renderPage }) {
    const sheet = new ServerStyleSheet()
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
    const styleTags = sheet.getStyleElement()
    return { ...page, styleTags }
  }

  render () {
    return (
      <html>
        <Head>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='shortcut icon' href='/static/favicon.ico' />
          <style>
            @import url(https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,600,700);
            @import url(https://fonts.googleapis.com/css?family=IBM+Plex+Mono:200i,200,500);
            @import url(https://fonts.googleapis.com/css?family=IBM+Plex+Serif:300,400);
          </style>
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

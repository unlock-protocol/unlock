import App from 'next/app'
import React from 'react'

class UnlockApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Component {...pageProps} />
      </>
    )
  }
}

export default UnlockApp

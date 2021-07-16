import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import ReactGA from 'react-ga'
import Header from './Header'
import Footer from './Footer'
import Media from '../../theme/media'

import { GlobalWrapper } from './GlobalWrapper'

export default function Layout({ forContent, title, children }) {
  // Register pageview with Google Analytics on the client side only
  if (process.browser) {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }
  return (
    <GlobalWrapper>
      <Container>
        <Page>
          <Header forContent={forContent} title={title} />
          <Content>{children}</Content>
          {forContent && <Footer />}
        </Page>
      </Container>
    </GlobalWrapper>
  )
}

Layout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  forContent: PropTypes.bool,
}

Layout.defaultProps = {
  title: 'Unlock',
  children: null,
  forContent: false,
}

const Page = styled.div`
  max-width: 1080px;
  padding-top: 48px;
  margin: 0 auto;
  ${Media.phone`
    padding-top: 0px;
  `}
`

const Container = styled.div`
  background-color: var(--offwhite);
  font-family: 'IBM Plex Sans', sans-serif;
  justify-content: center;
  padding: 0px;
  padding-bottom: 60px; /* Leaving room for the members bar */
`

const Content = styled.div`
  color: var(--darkgrey);
  flex-direction: column;
  ${Media.phone`
    margin-top: 0px;
  `}
`

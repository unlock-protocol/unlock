import 'rsuite/dist/rsuite.min.css'
import Message from 'rsuite/Message'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'
import Media from '../../theme/media'

export const Layout = ({ forContent, title, children }) => {
  // You can use JSX in the message
  const message = ''
  return (
    <Container>
      {message && (
        <Message full showIcon closable type="info">
          {message}
        </Message>
      )}

      <Page>
        <Header forContent={forContent} title={title} />
        <Content>{children}</Content>
        {forContent && <Footer />}
      </Page>
    </Container>
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

export default Layout

const Page = styled.div`
  max-width: 1080px;
  padding: 16px;
  padding-top: 24px;
  margin: 0 auto;
  ${Media.phone`
    padding: 0px;
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
    padding-left: 16px;
    padding-right: 16px;
  `}
`

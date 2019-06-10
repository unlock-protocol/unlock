import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Intercom from 'react-intercom'
import getConfig from 'next/config'
import Header from './Header'
import Footer from './Footer'
import { RoundedLogo } from './Logo'
import Media from '../../theme/media'

const config = getConfig().publicRuntimeConfig

export default function Layout({ forContent, title, children }) {
  return (
    <Container>
      <Left>
        {!forContent && (
          <Link href="/">
            <a>
              <RoundedLogo />
            </a>
          </Link>
        )}
      </Left>
      <Content>
        <Header forContent={forContent} title={title} />
        {children}
        <Intercom appID={config.intercomAppId} />
        {forContent && <Footer />}
      </Content>
      <Right />
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

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr minmax(280px, 4fr) 1fr;
  ${Media.phone`
    display: flex;
    padding-left: 6px;
    padding-right: 6px;
  `};
`

const Left = styled.div`
  display: grid;
  align-items: start;
  height: 24px;

  ${Media.phone`
    display: none;
  `};
`

const Right = styled.div`
  ${Media.phone`
    display: none;
  `};
`

const Content = styled.div`
  color: var(--darkgrey);
  display: grid;
  row-gap: 24px;
  width: 100%;
`

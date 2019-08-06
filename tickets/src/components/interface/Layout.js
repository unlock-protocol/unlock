import Link from 'next/link'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Media from '../../theme/media'
import { RoundedLogo } from './Logo'

export default function Layout({ noHeader, children }) {
  return (
    <Container>
      <Left />
      <Content>
        <Header>
          {!noHeader && (
            <Link href="/" passHref>
              <HomeLink>Unlock Tickets</HomeLink>
            </Link>
          )}
        </Header>
        {children}
        <Footer>
          <RoundedLogo />
          <p>Powered by Unlock</p>
        </Footer>
      </Content>
      <Right />
    </Container>
  )
}

Layout.propTypes = {
  children: PropTypes.node,
  noHeader: PropTypes.bool,
}

Layout.defaultProps = {
  children: null,
  noHeader: false,
}

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 1fr minmax(500px, 10fr) 1fr;
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

const Footer = styled.div`
  position: relative;
  bottom: 0;
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  padding: 0 20px;
  ${Media.phone`
    display: none;
  `};
`

const Header = styled.div`
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
  color: var(--brand);
  ${Media.phone`
    display: none;
  `};
`

const HomeLink = styled.span`
  cursor: pointer;
  color: var(--brand);
`

const Content = styled.div`
  color: var(--darkgrey);
  display: grid;
  row-gap: 12px;
  width: 100%;
  height: 100%;
`

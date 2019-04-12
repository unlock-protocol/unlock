import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Media from '../../theme/media'
import { RoundedLogo } from './Logo'

export default function Layout({ children }) {
  return (
    <Container>
      <Left />
      <Content>
        <Header>Unlock Tickets</Header>
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
}

Layout.defaultProps = {
  children: null,
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

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  padding: 100px 0;
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  height: 50px;
  ${Media.phone`
    display: none;
  `};
`

const Header = styled.div`
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

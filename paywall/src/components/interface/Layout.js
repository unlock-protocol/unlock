import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import LeftHeader from './LeftHeader'
import Header from './Header'
import Footer from './Footer'
import Media from '../../theme/media'

export default function Layout({ title, children, showIcons }) {
  const ThisHeader = showIcons ? Header : LeftHeader
  return (
    <Container>
      <Left />
      <Content>
        <ThisHeader title={title} />
        {children}
        <Footer />
      </Content>
      <Right />
    </Container>
  )
}

Layout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  showIcons: PropTypes.bool,
}

Layout.defaultProps = {
  title: 'Unlock',
  children: null,
  showIcons: false,
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

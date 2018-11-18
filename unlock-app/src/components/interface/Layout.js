import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Header from './Header'
import Footer from './Footer'
import Logo from './Logo'

export default function Layout({ forContent, title, children }) {
  return (
    <Container>
      <Left>
        {!forContent &&
          <Link href="/">
            <a><Logo /></a>
          </Link>
        }
      </Left>
      <Content>
        <Header forContent={forContent} title={title} />
        {children}
        {forContent &&
          <Footer />
        }
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
  grid-template-columns: 1fr minmax(300px, 4fr) 1fr;
`

const Left = styled.div`
  padding: 8px;
  display: grid;
  align-items: start;
  height: 24px;

  &>* {
    @media (max-width: 500px) {
      display: none;
    }
  }
`

const Right = styled.div`
  &>* {
    @media (max-width: 500px) {
      display: none;
    }
  }
`

const Content = styled.div`
  color: var(--darkgrey);
  display: grid;
  row-gap: 24px;
`

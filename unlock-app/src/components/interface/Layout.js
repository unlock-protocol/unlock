import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'
import Unlock from './icons/Unlock'

export default function Layout({ forContent, title, children }) {
  return (
    <Container>
      <Left>
        {!forContent &&
          <Unlock />
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
  children: PropTypes.Component,
  forContent: PropTypes.bool,
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr minmax(300px, 65%) 1fr;
`

const Left = styled.div`
  display: grid;
  align-items: start;
  height: 24px;
`

const Right = styled.div`
`

const Content = styled.div`
  display: grid;
  row-gap: 20px;
`

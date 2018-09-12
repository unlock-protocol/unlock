import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import Header from './Header'
import Unlock from './icons/Unlock'

export default class Layout extends Component {
  render() {
    return (
      <Container>
        <Left>
          <Unlock />
        </Left>
        <Content>
          <Header title={this.props.title} />
          {this.props.children}
        </Content>
        <Right />
      </Container>
    )
  }
}

Layout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.Component,
}

const Container = styled.div`
  display: grid;
  padding: 16px;
  grid-template-columns: 1fr minmax(300px, 65%) 1fr;
`

const Left = styled.div`
  display: grid;
  font-size: 56px;
  align-items: top;
`

const Right = styled.div`
`

const Content = styled.div`
  display: grid;
  row-gap: 20px;
`

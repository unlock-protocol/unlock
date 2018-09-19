import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import Icons from './icons'

export default class Header extends Component {
  render() {
    return (
      <TopHeader>
        <h1>{this.props.title}</h1>
        <Button><Icons.About /></Button>
        <Button><Icons.Jobs /></Button>
        <Button><Icons.Github /></Button>
      </TopHeader>
    )
  }
}

Header.propTypes = {
  title: PropTypes.string,
}

const TopHeader = styled.header`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr repeat(3, 24px);
  grid-auto-flow: column;
  align-items: center;
`

const Button = styled.a`
  height: 24px;
  display: grid;
`

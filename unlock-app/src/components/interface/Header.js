import React, { Component } from 'react'
import styled from 'styled-components'
import Icons from './icons'

export default class Header extends Component {
  render() {
    return (
      <TopHeader>
        <h1>Creator Dashboard</h1>
        <a><Icons.About /></a>
        <a><Icons.Jobs /></a>
        <a><Icons.Github /></a>
      </TopHeader>
    )
  }
}

const TopHeader = styled.header`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr;
  grid-auto-flow: column;
  align-items: center;
  height: 72px;
  font-size: 24px;
`

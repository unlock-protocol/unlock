import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Icons from './icons'

export default function Header({ forContent, title }) {
  return (
    <TopHeader>
      {!forContent &&
        <h1>{title}</h1>
      }
      {!!forContent &&
        <Logo>
          <Icons.UnlockWordMark />
        </Logo>
      }
      <Button><Icons.About /></Button>
      <Button><Icons.Jobs /></Button>
      <Button><Icons.Github /></Button>
    </TopHeader>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  forContent: PropTypes.bool,
}

const TopHeader = styled.header`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr repeat(3, 24px);
  grid-auto-flow: column;
  align-items: center;
`

const Logo = styled.span`
  font-size: 6em;
  display: grid;
  align-items: center;
  `

const Button = styled.a`
  height: 24px;
  display: grid;
`

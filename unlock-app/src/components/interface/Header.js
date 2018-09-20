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
      <Button><Icons.About fill={'white'} /></Button>
      <Button><Icons.Jobs fill={'white'} /></Button>
      <Button><Icons.Github fill={'white'} /></Button>
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
  background-color: var(--grey);
  border-radius: 50%;
  height: 24px;
  display: grid;
`

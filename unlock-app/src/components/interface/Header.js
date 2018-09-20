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
        <Icons.UnlockWordMark height={'28px'} />
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
  height: 70px;
`

const Button = styled.a`
  background-color: var(--grey);
  border-radius: 50%;
  height: 24px;
  display: grid;
`

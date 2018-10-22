import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Svg from './svg'
import Buttons from './buttons/layout'
import Link from 'next/link'

export default function Header({ forContent, title }) {
  return (
    <TopHeader>
      {!forContent &&
        <Title>{title}</Title>
      }
      {!!forContent &&
        <Link href={'/'}>
          <a><Svg.UnlockWordMark height={'28px'} width={'100%'} /></a>
        </Link>
      }
      <Buttons.About />
      <Buttons.Jobs />
      <Buttons.Github />
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

const Title = styled.h1`
  color: var(--grey);
`

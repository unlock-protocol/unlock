import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { WordMarkLogo } from './Logo'
import Media from '../../theme/media'

export function HeaderTitle({ title }) {
  return (
    <Title forContent>
      <Link href="/">
        <TitleLink>
          <WordMarkLogo viewBox="0 0 1200 256" height="28px" name="Unlock" />
        </TitleLink>
      </Link>
      <TitleText>{title}</TitleText>
    </Title>
  )
}

HeaderTitle.propTypes = {
  title: PropTypes.string,
}

HeaderTitle.defaultProps = {
  title: 'Unlock',
}

export default HeaderTitle

const TitleLink = styled.a`
  padding-bottom: 2px;
  margin-right: -8px;
`

const Title = styled.h1`
  color: var(--darkgrey);
  display: flex;
  align-items: flex-end;
  ${Media.phone`
    display: grid;
    grid-gap: 0;
    grid-template-columns: 123px auto;
  `};
`

const TitleText = styled.span`
  font-size: 32px;
  line-height: 47px;
  font-weight: 300;
`

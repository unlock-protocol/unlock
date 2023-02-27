import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import HeaderTitle from './HeaderTitle'
import Media from '../../theme/media'

export default function LeftHeader({ title }) {
  return (
    <TopHeader>
      <HeaderTitle title={title} />
    </TopHeader>
  )
}

LeftHeader.propTypes = {
  title: PropTypes.string,
}

LeftHeader.defaultProps = {
  title: 'Unlock',
}

const TopHeader = styled.header`
  display: grid;
  grid-gap: 0;
  grid-template-columns: 1fr auto;
  grid-auto-flow: column;
  align-items: center;
  height: 70px;

  ${Media.phone`
    grid-template-columns: [first] 1fr [second] 48px;
    grid-template-rows: [first] auto;
    height: auto;
  `};
`

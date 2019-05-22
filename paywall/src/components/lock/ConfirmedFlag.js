import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { RoundedLogo } from '../interface/Logo'
import ConfirmedKey, {
  Checkmark,
  Arrow,
  ConfirmedKeyButton,
} from '../interface/buttons/overlay/ConfirmedKey'
import {
  OptimisticFlag,
  OptimisticLogo,
  PoweredByUnlock,
  ConfirmedKeyWrapper,
} from './FlagStyles'
import Media from '../../theme/media'

export default function ConfirmedFlag({ dismiss }) {
  return (
    <ClickableFlag onClick={() => dismiss()}>
      <OptimisticLogo>
        <RoundedLogo size="28px" />
      </OptimisticLogo>
      <p>Purchase Confirmed</p>
      <ConfirmedKeyWrapper>
        <ConfirmedKey height="24px" width="24px" onClick={dismiss} />
      </ConfirmedKeyWrapper>
      <PoweredByUnlock>
        <p>Powered by</p>
        <OptimisticLogo>
          <RoundedLogo />
        </OptimisticLogo>
        <a href="/">Unlock</a>
      </PoweredByUnlock>
    </ClickableFlag>
  )
}

ConfirmedFlag.propTypes = {
  dismiss: PropTypes.func.isRequired,
}

const ClickableFlag = styled(OptimisticFlag)`
  grid-template-columns: 25px 1fr 10px;
  & > p {
    text-align: center;
    margin-left: 0;
  }
  ${Media.phone`
    grid-template-columns: 1fr 36px 1fr;
    & > p {
      text-align: right;
      margin-right: 16px;
    }
  `}
  &:hover {
    cursor: pointer;
    ${ConfirmedKeyButton} {
      background-color: var(--green);
      & svg {
        fill: var(--white);
      }
    }
    ${Arrow} {
      display: block;
    }
    ${Checkmark} {
      display: none;
    }
  }
`

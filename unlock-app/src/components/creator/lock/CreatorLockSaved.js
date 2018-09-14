import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Icons from '../../interface/icons'

export function CreatorLockSaved({ lock }) {
  return (
    <LockIconBar>
      <LockIconBarIcon>
        <Icons.Withdraw />
      </LockIconBarIcon>
      <LockIconBarIcon>
        <Icons.Edit />
      </LockIconBarIcon>
      <LockIconBarIcon>
        <Icons.Download />
      </LockIconBarIcon>
      <LockIconBarIcon>
        <Icons.Code />
      </LockIconBarIcon>
    </LockIconBar>
  )
}

CreatorLockSaved.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default CreatorLockSaved

const LockIconBar = styled.div`
  text-align: right;
  padding-right: 10px;
  padding: 0;
  margin: 0;
  font-size: 28px;
`

const LockIconBarIcon = styled.div`
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
`

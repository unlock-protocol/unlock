import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Icons from '../../interface/icons'

export function LockIconBar({ lock }) {
  return (
    <IconBar>
      <Button>
        <Icons.Withdraw width="100%" height="100%" />
      </Button>
      <Button>
        <Icons.Edit width="100%" height="100%" />
      </Button>
      <Button>
        <Icons.Download width="100%" height="100%" />
      </Button>
      <Button>
        <Icons.Code width="100%" height="100%" />
      </Button>
    </IconBar>
  )
}

LockIconBar.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default LockIconBar

const IconBar = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(4, 24px);
`

const Button = styled.a`
  height: 24px;
  display: grid;
`

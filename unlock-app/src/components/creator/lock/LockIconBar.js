import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import Icons from '../../interface/icons'

export function LockIconBar({ lock }) {
  return (
    <IconBar>
      <Button>
        <Icons.Withdraw fill={'#a6a6a6'} />
      </Button>
      <Button>
        <Icons.Edit fill={'#a6a6a6'} />
      </Button>
      <Button>
        <Icons.Export fill={'#a6a6a6'} />
      </Button>
      <Button>
        <Icons.Code fill={'#a6a6a6'} />
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
  background-color: var(--lightgrey);
  border-radius: 50%;
  height: 24px;
  display: grid;
`

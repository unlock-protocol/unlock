import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { dismissWalletCheck } from '../../actions/fullScreenModals'
import { KindOfModal } from '../../unlockTypes'

interface Props {
  active: boolean
  kindOfModal: KindOfModal
  dispatch: (action: any) => any
}

export const WalletCheck = ({
  dispatch,
}: {
  dispatch: (action: any) => any
}) => (
  <MessageBox>
    <p>Please check your browser wallet to complete the transaction.</p>
    <Dismiss onClick={() => dispatch(dismissWalletCheck())}>Dismiss</Dismiss>
  </MessageBox>
)

export const FullScreenModal = ({ active, kindOfModal, dispatch }: Props) => {
  let Template: React.SFC<any>
  switch (kindOfModal) {
    case KindOfModal.WalletCheckOverlay:
      Template = WalletCheck
      break
    default:
      // We were given a KindOfModal that we don't have a template for. Do nothing.
      return null
  }

  if (active) {
    // render a modal
    return (
      <Greyout>
        <Template dispatch={dispatch} />
      </Greyout>
    )
  }
  // Otherwise do nothing
  return null
}

interface State {
  fullScreenModalStatus: {
    active: boolean
    kindOfModal: KindOfModal
  }
}

const mapStateToProps = (state: State) => {
  const {
    fullScreenModalStatus: { active, kindOfModal },
  } = state
  return {
    active,
    kindOfModal,
  }
}

const Dismiss = styled.button`
  height: 24px;
  font-size: 20px;
  font-family: Roboto, sans-serif;
  text-align: center;
  border: none;
  background: none;
  color: var(--grey);

  &:hover {
    color: var(--link);
  }
`

const MessageBox = styled.div`
  background: var(--white);
  min-width: 50%;
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--darkgrey);
  font-size: 20px;
`

const Greyout = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: var(--alwaysontop);
`

export default connect(mapStateToProps)(FullScreenModal)

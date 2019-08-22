import React from 'react'
import { dismissWalletCheck } from '../../../actions/fullScreenModals'
import { MessageBox, Dismiss } from './styles'
import { Dispatch } from '../../../unlockTypes' // eslint-disable-line

const WalletCheck = ({ dispatch }: { dispatch: Dispatch }) => (
  <MessageBox>
    <p>Please check your browser wallet.</p>
    <Dismiss onClick={() => dispatch(dismissWalletCheck())}>Dismiss</Dismiss>
  </MessageBox>
)

export default WalletCheck

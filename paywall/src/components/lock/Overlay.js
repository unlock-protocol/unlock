import styled from 'styled-components'
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Lock from './Lock'
import UnlockPropTypes from '../../propTypes'
import { hideModal, showModal } from '../../actions/modal'
import { LockedFlag } from './UnlockFlag'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { mapErrorToComponent } from '../creator/FatalError'
import { FATAL_NO_USER_ACCOUNT, FATAL_MISSING_PROVIDER } from '../../errors'
import withConfig from '../../utils/withConfig'
import usePostMessage from '../../hooks/browser/usePostMessage'
import Media from '../../theme/media'

import ConfirmedFlag from './ConfirmedFlag'
import ConfirmingFlag from './ConfirmingFlag'
import { TRANSACTION_TYPES } from '../../constants'
import {
  POST_MESSAGE_GET_OPTIMISTIC,
  POST_MESSAGE_GET_PESSIMISTIC,
} from '../../paywall-builder/constants'

export const displayError = isMainWindow =>
  function overlayDisplayError(error, errorMetadata, children) {
    const Error = mapErrorToComponent(error, errorMetadata)

    /*
     This next section provides an escape hatch for the paywall if a global error condition exists.
     Only the MISSING_PROVIDER and WRONG_NETWORK error conditions (and not NO_USER_ACCOUNT)
     cause an error to be displayed instead of the lock when the paywall is in an iframe. This
     allows us to show a lock that will open a new window if we are in a wallet browser such
     as coinbase that does not inject the provider account into iframes.
    */
    if (isMainWindow) {
      // TODO: don't show fatal error until user clicks the lock
      if (error) {
        return Error
      }
    } else {
      if (
        error &&
        error !== FATAL_NO_USER_ACCOUNT &&
        error !== FATAL_MISSING_PROVIDER
      ) {
        return Error
      }
    }
    return <React.Fragment>{children}</React.Fragment>
  }

export const Overlay = ({
  locks,
  hideModal,
  showModal,
  scrollPosition,
  openInNewWindow,
  config: { isInIframe, requiredConfirmations },
  transaction,
  optimism,
  smallBody,
  bigBody,
}) => {
  let message
  if (transaction) {
    if (transaction.confirmations < requiredConfirmations) {
      message = 'Purchase pending...'
    } else {
      message = 'Purchase confirmed, content unlocked!'
    }
  } else {
    message =
      'You have reached your limit of free articles. Please purchase access'
  }
  const { postMessage } = usePostMessage()
  useEffect(() => {
    if (optimism.current && transaction) {
      postMessage(POST_MESSAGE_GET_OPTIMISTIC)
      smallBody()
    } else {
      // this branch should execute even if we are optimstic but have no transaction
      postMessage(POST_MESSAGE_GET_PESSIMISTIC)
      bigBody()
    }
  }, [optimism.current, transaction])
  if (optimism.current && transaction) {
    if (transaction.confirmations >= requiredConfirmations) {
      return <ConfirmedFlag dismiss={hideModal} />
    }
    return (
      <ConfirmingFlag
        transaction={transaction}
        lock={locks[0]}
        requiredConfirmations={requiredConfirmations}
      />
    )
  }
  return (
    <FullPage>
      <Banner scrollPosition={scrollPosition} data-testid="paywall-banner">
        <Headline>{message}</Headline>
        <Locks>
          <GlobalErrorConsumer displayError={displayError(!isInIframe)}>
            {locks.map(lock => (
              <Lock
                key={JSON.stringify(lock)}
                lock={lock}
                hideModal={hideModal}
                showModal={showModal}
                openInNewWindow={openInNewWindow}
              />
            ))}
          </GlobalErrorConsumer>
        </Locks>
        <LockedFlag />
      </Banner>
    </FullPage>
  )
}

Overlay.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  hideModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  smallBody: PropTypes.func.isRequired,
  bigBody: PropTypes.func.isRequired,
  scrollPosition: PropTypes.number.isRequired,
  openInNewWindow: PropTypes.bool.isRequired,
  config: UnlockPropTypes.configuration.isRequired,
  transaction: UnlockPropTypes.transaction,
  optimism: PropTypes.shape({
    current: PropTypes.oneOf([0, 1]).isRequired,
    past: PropTypes.oneOf([0, 1]).isRequired,
  }).isRequired,
}

Overlay.defaultProps = {
  transaction: null,
}
export const mapStateToProps = ({ account, transactions, keys }, { locks }) => {
  const lock = locks.length ? locks[0] : {}

  // If there is no account (probably not loaded yet), we do not want to create a key
  // similarly, if there is no lock
  if (!account || !lock) {
    return {
      transaction: null,
      openInNewWindow: !account || !!account.fromLocalStorage,
    }
  }

  let transaction = null

  const lockKey = Object.values(keys).find(
    key => key.lock === lock.address && key.owner === account.address
  )

  // Let's select the transaction corresponding to this key purchase, if it exists
  // This transaction is of type KEY_PURCHASE
  transaction = Object.values(transactions).find(
    transaction =>
      transaction.type === TRANSACTION_TYPES.KEY_PURCHASE &&
      transaction.key === (lockKey && lockKey.id)
  )

  return {
    transaction: transaction ? transaction : null,
    openInNewWindow: !account || !!account.fromLocalStorage,
  }
}

export const mapDispatchToProps = (dispatch, { locks }) => ({
  hideModal: () => {
    dispatch(hideModal(locks.map(l => l.address).join('-')))
  },
  showModal: () => {
    dispatch(showModal(locks.map(l => l.address).join('-')))
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withConfig(Overlay))

const FullPage = styled.div`
  position: fixed; /* Sit on top of the page content */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(255, 255, 255, 0) 18%,
    rgba(255, 255, 255, 0) 29%,
    var(--offwhite) 48%
  );
`

const Banner = styled.div.attrs(({ scrollPosition }) => ({
  style: {
    height: Math.min(scrollPosition, 100) + '%',
  },
}))`
  position: fixed;
  display: grid;
  min-height: 375px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--offwhite);
  justify-items: center;
  padding: 32px;
  padding-bottom: 100px;
  grid-gap: 24px;
  align-self: center;
  ${Media.phone`
    min-height: 390px;
  `}
`

const Headline = styled.h1.attrs({
  className: 'headline',
})`
  font-size: 20px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
  color: var(--slate);
  text-align: center;

  ${Media.phone`
    font-size: 13px;
  `}
`

const Locks = styled.ul`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 32px;
  list-style: none;
  margin: 0px;
  padding: 0px;
  grid-row: 2;
  grid-column: 1;
`

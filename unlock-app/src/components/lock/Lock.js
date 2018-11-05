import uniqid from 'uniqid'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import { connect } from 'react-redux'
import Balance from '../helpers/Balance'
import UnlockPropTypes from '../../propTypes'

import { purchaseKey } from '../../actions/key'

export const Lock = ({ lock, lockKey, transaction, purchaseKey }) => {
  let purchaseButton = (
    <PurchaseButton
      onClick={() => {
        purchaseKey(lockKey)
      }}
    >
      Purchase
    </PurchaseButton>
  )
  if (!lockKey) {
    purchaseButton = null
  } else if (!transaction) {
    // No transaction attached to the key. What is it?
    // Maybe we just lost track of that transaction?
    // Is the key valid?
  } else if (transaction.status === 'mined') {
    purchaseButton = (
      <PurchaseButton>
        Mined! Confirming...
        {transaction.confirmations}
      </PurchaseButton>
    )
    // Key transaction was mined: it is mined, let's look at confirmations
  } else if (transaction.status === 'submitted') {
    purchaseButton = <PurchaseButton>Submitted!</PurchaseButton>
    // Ok, let's wait and not show another button!
  }

  return (
    <Wrapper>
      <Name>{lock.name}</Name>
      <EtherPrice>
        <Balance amount={lock.keyPrice} convertCurrency={false} />
      </EtherPrice>
      {lock.fiatPrice && <FiatPrice>
$
        {lock.fiatPrice}
      </FiatPrice>}
      {purchaseButton}
    </Wrapper>
  )
}

Lock.propTypes = {
  lockKey: UnlockPropTypes.key,
  lock: UnlockPropTypes.lock,
  transaction: UnlockPropTypes.transaction,
  purchaseKey: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
  purchaseKey: key => dispatch(purchaseKey(key)),
})

export const mapStateToProps = (state, { lock }) => {
  const account = state.network.account

  // If there is no account (probably not loaded yet), we do not want to create a key
  if (!account) {
    return {}
  }

  let lockKey = Object.values(state.keys).find(
    key => key.lockAddress === lock.address && key.owner === account.address
  )
  let transaction = null

  if (!lockKey) {
    lockKey = {
      id: uniqid(),
      lockAddress: lock.address,
      owner: account.address,
    }
  } else {
    transaction = state.transactions[lockKey.transaction]
  }

  return {
    lockKey,
    transaction,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Lock)

const Wrapper = styled.li`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: stretch;
  margin: 0px;
  padding: 0px;
  width: 200px;
  background-color: var(--white);
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  border-radius: 4px;
  height: 200px;
`

const PurchaseButton = styled.div`
  display: grid;
  height: 40px;
  font-weight: 300;
  align-self: end;
  justify-content: center;
  align-content: center;
  background-color: var(--lightgrey);
  border-radius: 0px 0px 4px 4px;

  &:hover {
    cursor: pointer;
    color: var(--white);
    background-color: var(--link);
  }
`

const Name = styled.header`
  display: grid;
  height: 40px;
  font-weight: 300;
  justify-content: center;
  align-content: center;
  background-color: var(--lightgrey);
  font-size: 20px;
  color: var(--grey);
  border-radius: 4px 4px 0px 0px;
  text-transform: capitalize;
`

const EtherPrice = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  font-size: 30px;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: bold;
`

const FiatPrice = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  font-size: 20px;
  margin-top: 8px;
  font-weight: 300;
`

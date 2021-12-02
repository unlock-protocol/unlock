import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

import CreatorLock from './CreatorLock'
import { LockRowGrid, PhoneLockRowGrid } from './LockStyles'
import CreatorLockForm from './CreatorLockForm'
import Errors from '../interface/Errors'
import Media, { NoPhone, Phone } from '../../theme/media'
import { DefaultError } from './FatalError'
import Loading from '../interface/Loading'
import { useLocks } from '../../hooks/useLocks'
import { useAccount } from '../../hooks/useAccount'
import { ConfigContext } from '../../utils/withConfig'

const BalanceWarning = () => {
  const config = useContext(ConfigContext)
  const { account, network } = useContext(AuthenticationContext)
  // @ts-expect-error account is _always_ defined in this component
  const { getTokenBalance } = useAccount(account, network)

  const [balance, setBalance] = useState(-1) // default to negative balance so we do not show messages while loading

  useEffect(() => {
    const getBalance = async () => {
      const _balance = await getTokenBalance()
      setBalance(parseFloat(_balance))
    }
    getBalance()
  }, [account, network])

  if (balance !== 0) {
    return null
  }

  const warning = (
    <>
      You currently do not have any{' '}
      {config.networks[network].baseCurrencySymbol} token to pay for gas to
      deploy on the {config.networks[network].name} network.{' '}
    </>
  )

  let callToAction = null
  if (network === 1) {
    callToAction = (
      <>
        Purchase some Ether using{' '}
        <a href="https://www.coinbase.com/" target="_blank" rel="noreferrer">
          Coinbase
        </a>
      </>
    )
  }

  if (network === 100) {
    // TODO: check whether they actually have DAI on mainnet first?
    callToAction = (
      <>
        Transfer some Ethereum&apos;s DAI to the xDAI chain using{' '}
        <a
          href="https://omni.xdaichain.com/bridge"
          target="_blank"
          rel="noreferrer"
        >
          the Omnibridge.
        </a>
      </>
    )
  }

  if (network === 137) {
    // TODO: check whether they actually have DAI on mainnet first?
    callToAction = (
      <>
        Transfer some Matic to the Polygon chain using{' '}
        <a
          href="https://wallet.matic.network/bridge"
          target="_blank"
          rel="noreferrer"
        >
          the Bridge.
        </a>
      </>
    )
  }

  return (
    <Warning>
      {warning}
      {callToAction}
    </Warning>
  )
}

export const CreatorLocks = ({ formIsVisible, hideForm }) => {
  const { account, network } = useContext(AuthenticationContext)
  const { loading, locks, addLock, error } = useLocks(account)

  return (
    <Locks>
      <BalanceWarning />

      <LockHeaderRow>
        <LockHeader>Locks</LockHeader>
        <LockMinorHeader>Name / Address</LockMinorHeader>
        <LockMinorHeader>Key Duration</LockMinorHeader>
        <Quantity>Key Quantity</Quantity>
        <LockMinorHeader>Price</LockMinorHeader>
        <LockMinorHeader>
          <NoPhone>Balance</NoPhone>
          <Phone>Balance</Phone>
        </LockMinorHeader>
      </LockHeaderRow>
      <Errors />
      {formIsVisible && (
        <CreatorLockForm
          hideAction={hideForm}
          saveLock={async (lock) => {
            await addLock(lock, hideForm)
          }}
          pending
        />
      )}
      {locks.length > 0 &&
        locks.map((lock) => {
          return (
            <CreatorLock
              showIntegrations={locks.length == 1}
              key={lock.address}
              lock={lock}
              network={network}
            />
          )
        })}
      {locks.length === 0 && !loading && !formIsVisible && (
        <DefaultError
          title="Create a lock to get started"
          illustration="/images/illustrations/lock.svg"
          critical={false}
        >
          You have not created any locks yet. Create your first lock in seconds
          by clicking on the &#8216;Create Lock&#8217; button.
        </DefaultError>
      )}
      {loading && <Loading />}
    </Locks>
  )
}

CreatorLocks.propTypes = {
  formIsVisible: PropTypes.bool.isRequired,
  hideForm: PropTypes.func.isRequired,
}
export default CreatorLocks

const Locks = styled.section`
  display: grid;
  grid-gap: 32px;
`

const LockHeaderRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  padding-left: 8px;
  font-size: 14px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid} align-items: center;
  ${Media.phone`
    ${PhoneLockRowGrid} align-items: start;
    grid-gap: 4px;
  `};
`

const LockHeader = styled.div`
  font-family: 'IBM Plex Sans';
  font-size: 13px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: var(--grey);
  ${Media.phone`
    grid-row: span 2;
  `};
`

const LockMinorHeader = styled.div`
  font-family: 'IBM Plex Mono';
  font-size: 8px;
  font-weight: thin;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--darkgrey);
`

export const Quantity = styled(LockMinorHeader)`
  ${Media.phone`
    grid-row: span 2;
  `};
`

const Warning = styled.p`
  border: 1px solid var(--red);
  border-radius: 4px;
  padding: 10px;
  color: var(--red);
`

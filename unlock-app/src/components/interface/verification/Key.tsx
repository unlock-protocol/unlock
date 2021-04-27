import React, { useContext } from 'react'
import styled from 'styled-components'
import { WalletService } from '@unlock-protocol/unlock-js'
import { AuthenticationContext } from '../Authenticate'
// import useGetMetadataFor from '../../../hooks/useGetMetadataFor'
import useMarkAsCheckedIn from '../../../hooks/useMarkAsCheckedIn'
import { pingPoap } from '../../../utils/poap'
import { OwnedKey } from '../keychain/KeychainTypes'
import Svg from '../svg'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../../utils/durations'
import { ActionButton } from '../buttons/ActionButton'
import { ConfigContext } from '../../../utils/withConfig'
import { WalletServiceContext } from '../../../utils/withWalletService'
import Loading from '../Loading'
import useIsLockManager from '../../../hooks/useIsLockManager'

/**
 * Shows an invalid key. Since we cannot trust any of the data, we don't show any
 */
export const InvalidKey = () => {
  return (
    <Wrapper>
      <Box color="--red">
        <Circle>
          <Svg.Close title="Invalid" />
        </Circle>
        <KeyStatus>Key Invalid</KeyStatus>
      </Box>
    </Wrapper>
  )
}
interface ValidKeyWithMetadataProps {
  ownedKey: OwnedKey
  metadata: any
  owner: string
  expirationDate: string
  timeElapsedSinceSignature: string
  viewerIsLockOwner: boolean
  checkIn: () => any
  checkedIn: boolean
}

/**
 * Valid Key with metadata
 */
export const ValidKeyWithMetadata = ({
  ownedKey,
  owner,
  metadata,
  expirationDate,
  timeElapsedSinceSignature,
  viewerIsLockOwner,
  checkIn,
  checkedIn,
}: ValidKeyWithMetadataProps) => {
  let box = (
    <Box color="--green">
      <Circle>
        <Svg.Checkmark title="Valid" />
      </Circle>
      <KeyStatus>Valid Key</KeyStatus>
      <KeyExpiration>Until {expirationDate}</KeyExpiration>
    </Box>
  )

  if (metadata.checkedInAt) {
    const checkedInAgo =
      Math.floor(
        (new Date().getTime() - metadata.checkedInAt) / (60 * 1000) + 1
      ) * 60
    box = (
      <Box color="--yellow">
        <Circle>
          <Svg.Checkmark title="Valid" />
        </Circle>
        <KeyStatus>Valid Key</KeyStatus>
        <KeyExpiration>Until {expirationDate}</KeyExpiration>
        <KeyCheckedInTime>
          Checked-in {durationsAsTextFromSeconds(checkedInAgo)} ago
        </KeyCheckedInTime>
      </Box>
    )
  }

  const alreadyCheckedIn = checkedIn || metadata.checkedInAt

  return (
    <Wrapper>
      {box}
      <KeyInfo>
        <Label>Lock Name</Label>
        <Value>{ownedKey.lock.name}</Value>
        <Label>Token Id</Label>
        <Value>{ownedKey.keyId}</Value>
        <Label>Owner Address</Label>
        <Value>{owner}</Value>
        <Label>Time Since signed</Label>
        <Value>{timeElapsedSinceSignature}</Value>
        {metadata.userMetadata && attributes(metadata.userMetadata.protected)}
        {metadata.userMetadata && attributes(metadata.userMetadata.public)}
        {viewerIsLockOwner && (
          <CheckInButton onClick={checkIn} disabled={alreadyCheckedIn}>
            {!alreadyCheckedIn && 'Mark as Checked-In'}
            {alreadyCheckedIn && 'Already Checked-In'}
          </CheckInButton>
        )}
      </KeyInfo>
    </Wrapper>
  )
}

interface ValidKeyProps {
  ownedKey: OwnedKey
  viewer?: string | null
  signatureTimestamp: number
  owner: string
  signature: string
}

/**
 * Shows a valid key.
 * If the viewer is the lock owner, include the metadata
 */
export const ValidKey = ({
  ownedKey,
  signatureTimestamp,
  owner,
  viewer,
  signature,
}: ValidKeyProps) => {
  const walletService: WalletService = useContext(WalletServiceContext)
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)

  const { isLockManager, loading: isLockManagerLoading } = useIsLockManager(
    ownedKey.lock.address,
    network,
    viewer
  )
  const loading = false
  const metadata = {}
  const getMetadataForError = ''

  // TODO add back metadata when the logged in user is lock manager!
  // const { loading, metadata, error: getMetadataForError } = useGetMetadataFor(
  //   walletService,
  //   config,
  //   ownedKey.lock.address,
  //   ownedKey.keyId,
  //   isLockManager
  // )

  const {
    markAsCheckedIn,
    checkedIn,
    error: markAsCheckedInError,
  } = useMarkAsCheckedIn(walletService, config, ownedKey)

  const checkIn = () => {
    markAsCheckedIn()
    pingPoap(ownedKey, owner, signature, signatureTimestamp)
  }

  const secondsElapsedFromSignature = Math.floor(
    (Date.now() - signatureTimestamp) / 1000
  )

  if (loading || isLockManagerLoading) {
    return <Loading />
  }

  if (getMetadataForError || markAsCheckedInError) {
    // TODO: Do better
    return (
      <p>
        There was an error:{' '}
        {getMetadataForError.toString() || markAsCheckedInError.toString()}
      </p>
    )
  }

  return (
    <ValidKeyWithMetadata
      viewerIsLockOwner={isLockManager}
      ownedKey={ownedKey}
      timeElapsedSinceSignature={durationsAsTextFromSeconds(
        secondsElapsedFromSignature
      )}
      expirationDate={expirationAsDate(ownedKey.expiration)}
      owner={owner}
      metadata={metadata}
      checkIn={checkIn}
      checkedIn={checkedIn}
    />
  )
}

ValidKey.defaultProps = {
  viewer: null,
}

/**
 * A mapping of strings
 */
interface KeyMetadataAttributes {
  [key: string]: string
}

const attributes = (attributes: KeyMetadataAttributes) => {
  if (!attributes) {
    return false
  }
  return Object.keys(attributes).map((name: string) => {
    return (
      <React.Fragment key={name}>
        <Label>{name}</Label>
        <Value>{attributes[name]}</Value>
      </React.Fragment>
    )
  })
}
const Wrapper = styled.section`
  width: 100%;
`

const Box = styled.div`
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
  background-color: ${(props) => `var(${props.color})`};
  height: 290px;
  max-width: 290px;
  border-radius: 4px;
  color: var(--white);
  text-align: center;
  svg {
    width: 128px;
    fill: ${(props) => `var(${props.color})`};
    margin: 0 auto;
  }
  display: grid;
  justify-items: center;
`
const KeyStatus = styled.h1`
  margin: 0px;
`
const KeyExpiration = styled.h2`
  color: var(--darkgrey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  margin: 0px;
`

const KeyCheckedInTime = styled.h2`
  margin: 0px;
  color: var(--darkgrey);
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
`

const Circle = styled.div`
  height: 128px;
  width: 128px;
  border-radius: 100px;
  margin-top: 30px;
  background-color: var(--white);
`

const KeyInfo = styled.div`
  max-width: 290px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  display: grid;
`

const CheckInButton = styled(ActionButton)`
  max-width: 290px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 16px;
  color: var(--white);
`

const Label = styled.div`
  font-family: IBM Plex Sans;
  font-size: 10px;
  line-height: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
  color: var(--grey);
`
const Value = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: var(--darkgrey);
  margin-bottom: 15px;
  text-overflow: ellipsis;
  overflow: hidden;
`

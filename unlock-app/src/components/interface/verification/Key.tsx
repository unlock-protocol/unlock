import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useLock } from '../../../hooks/useLock'
import Svg from '../svg'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../../utils/durations'
import { ActionButton } from '../buttons/ActionButton'
import Loading from '../Loading'

interface InvalidKeyProps {
  reason: string
}

/**
 * Shows an invalid key. Since we cannot trust any of the data, we don't show any
 */
export const InvalidKey = ({ reason }: InvalidKeyProps) => {
  return (
    <Wrapper>
      <Box color="--red">
        <Circle>
          <Svg.Close title="Invalid" />
        </Circle>
        <KeyStatus>Key Invalid</KeyStatus>
      </Box>
      <KeyInfo>
        <Value>{reason}</Value>
      </KeyInfo>
    </Wrapper>
  )
}
interface ValidKeyWithMetadataProps {
  unlockKey: any
  keyData: any
  lock: any
  owner: string
  timeElapsedSinceSignature: string
  viewerIsLockOwner: boolean
  checkIn: () => any
  checkedIn: boolean
}

/**
 * Valid Key with metadata
 */
export const ValidKeyWithMetadata = ({
  unlockKey,
  owner,
  keyData,
  timeElapsedSinceSignature,
  viewerIsLockOwner,
  checkIn,
  checkedIn,
  lock,
}: ValidKeyWithMetadataProps) => {
  const expirationDate = expirationAsDate(unlockKey.expiration)
  let box = (
    <Box color="--green">
      <Circle>
        <Svg.Checkmark title="Valid" />
      </Circle>
      <KeyStatus>Valid Key</KeyStatus>
      <KeyExpiration>Until {expirationDate}</KeyExpiration>
    </Box>
  )

  if (keyData?.metadata?.checkedInAt) {
    const checkedInAgo =
      Math.floor(
        (new Date().getTime() - keyData?.metadata?.checkedInAt) / (60 * 1000) +
          1
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

  const alreadyCheckedIn = checkedIn || keyData?.metadata?.checkedInAt

  return (
    <Wrapper>
      {box}
      <KeyInfo>
        <Label>Lock Name</Label>
        <Value>{lock.name}</Value>
        <Label>Token Id</Label>
        <Value>{unlockKey.tokenId}</Value>
        <Label>Owner Address</Label>
        <Value>{owner}</Value>
        <Label>Time Since signed</Label>
        <Value>{timeElapsedSinceSignature}</Value>
        {keyData?.userMetadata && attributes(keyData?.userMetadata.protected)}
        {keyData?.userMetadata && attributes(keyData?.userMetadata.public)}
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
  unlockKey: any
  lock: any
  viewer?: string | null
  signatureTimestamp: number
  owner: string
  network: number
}

/**
 * Shows a valid key.
 * If the viewer is the lock owner, include the metadata
 */
export const ValidKey = ({
  unlockKey,
  lock,
  signatureTimestamp,
  owner,
  viewer,
  network,
}: ValidKeyProps) => {
  const [checkedIn, setCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewerIsLockOwner, setViewerIsLockOwner] = useState(false)
  const [keyData, setKeyData] = useState({})
  const { isLockManager, getKeyData, markAsCheckedIn } = useLock(lock, network)

  const checkIn = async () => {
    const success = await markAsCheckedIn(viewer, unlockKey.tokenId)
    if (success) {
      setCheckedIn(true)
    } else {
      setError('We could not mark this membership as checked in')
    }
  }

  const secondsElapsedFromSignature = Math.floor(
    (Date.now() - signatureTimestamp) / 1000
  )

  useEffect(() => {
    const onLoad = async () => {
      const _isLockManager = await isLockManager(viewer)
      if (_isLockManager) {
        setViewerIsLockOwner(true)
        const metadata = (await getKeyData(unlockKey.tokenId, viewer)) as any
        setKeyData(metadata || {})
      } else {
        setViewerIsLockOwner(false)
        const metadata = (await getKeyData(unlockKey.tokenId)) as any
        setKeyData(metadata || {})
      }
      setLoading(false)
    }
    onLoad()
  }, [lock.address, viewer])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error>{error}</Error>
  }

  return (
    <ValidKeyWithMetadata
      viewerIsLockOwner={viewerIsLockOwner}
      unlockKey={unlockKey}
      timeElapsedSinceSignature={durationsAsTextFromSeconds(
        secondsElapsedFromSignature
      )}
      lock={lock}
      owner={owner}
      keyData={keyData}
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
const Error = styled.p`
  color: var(--red);
`

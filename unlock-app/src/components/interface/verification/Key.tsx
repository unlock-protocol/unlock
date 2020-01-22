import React from 'react'
import styled from 'styled-components'
import useGetMetadataFor from '../../../hooks/useGetMetadataFor'
import { OwnedKey } from '../keychain/KeychainTypes'
import Svg from '../svg'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../../utils/durations'

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
}: ValidKeyWithMetadataProps) => {
  return (
    <Wrapper>
      <Box color="--green">
        <Circle>
          <Svg.Checkmark title="Valid" />
        </Circle>
        <KeyStatus>Valid Key</KeyStatus>
        <KeyExpiration>Until {expirationDate}</KeyExpiration>
      </Box>
      <KeyInfo>
        <Label>Lock Name</Label>
        <Value>{ownedKey.lock.name}</Value>
        <Label>Token Id</Label>
        <Value>{ownedKey.keyId}</Value>
        <Label>Owner Address</Label>
        <Value>{owner}</Value>
        <Label>Time Since signed</Label>
        <Value>{timeElapsedSinceSignature}</Value>
        {attributes(metadata.protected)}
        {attributes(metadata.public)}
      </KeyInfo>
    </Wrapper>
  )
}

interface ValidKeyProps {
  ownedKey: OwnedKey
  viewer: string
  signatureTimestamp: number
  owner: string
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
}: ValidKeyProps) => {
  // Let's get metadata if the viewer is the lock owner
  let metadata = {
    protected: {},
    public: {},
  }
  if (viewer.toLowerCase() === ownedKey.lock.owner.toLowerCase()) {
    metadata = useGetMetadataFor(ownedKey.lock.address, owner)
  }

  const secondsElapsedFromSignature = Math.floor(
    (Date.now() - signatureTimestamp) / 1000
  )

  return (
    <ValidKeyWithMetadata
      ownedKey={ownedKey}
      timeElapsedSinceSignature={durationsAsTextFromSeconds(
        secondsElapsedFromSignature
      )}
      expirationDate={expirationAsDate(ownedKey.expiration)}
      owner={owner}
      metadata={metadata}
    />
  )
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
  background-color: ${props => `var(${props.color})`};
  height: 290px;
  max-width: 290px;
  border-radius: 4px;
  color: var(--white);
  text-align: center;
  svg {
    width: 128px;
    fill: ${props => `var(${props.color})`};
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

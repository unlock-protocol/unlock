import React from 'react'
import { connect } from 'react-redux'
import { useQuery } from '@apollo/react-hooks'
import queryString from 'query-string'
import styled from 'styled-components'
import { Router } from '../../unlockTypes'
import Layout from '../interface/Layout'

import keyHolderQuery from '../../queries/keyHolder'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../utils/durations'

interface Bag {
  router: Router
  lockAddress?: string
  address?: string
}

export const VerificationContent = (router: any) => {
  return (
    <Layout title="Verification">
      {keyDetails(router.address.toLowerCase())}
    </Layout>
  )
}

export const mapStateToProps = ({ router }: Bag) => {
  const query = queryString.parse(router.location.search)
  return query
}

const formatPrice = price => {
  return parseInt(price) / Math.pow(10, 18)
}

const keyDetails = (address: any) => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :c</p>

  if (data.keyHolders.length == 0) {
    return <div></div>
  }

  return (
    <Container>
      {data.keyHolders[0].keys.map((ownedKeys: any) => {
        return (
          <Box key={ownedKeys.lock.id}>
            <LockName>{ownedKeys.lock.name}</LockName>
            <LockExpirationDuration>
              {durationsAsTextFromSeconds(ownedKeys.lock.expirationDuration)}
            </LockExpirationDuration>

            <ValidUntil>Valid Until</ValidUntil>
            <KeyExpiration>
              {expirationAsDate(ownedKeys.expiration)}
            </KeyExpiration>

            <KeyPrice>Ξ {formatPrice(ownedKeys.lock.price)}</KeyPrice>
          </Box>
        )
      })}
    </Container>
  )
}

const Box = styled.div`
  border: thin #dddddd solid;
  width: 212px;
  float: left;
  margin-right: 32px;
  &:hover {
    border: thin #aaaaaa solid;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
`

const LockName = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* or 127% */

  display: flex;
  align-items: center;
  color: #4d8be8;
  padding: 16px;
`

const LockExpirationDuration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* identical to box height, or 127% */

  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 18px;

  /* Grey 4 */

  color: #333333;
`

const ValidUntil = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 8px;
  line-height: 10px;
  /* identical to box height */

  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a6a6a6;
  padding-left: 16px;
`

const KeyExpiration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
  padding-left: 16px;
  padding-bottom: 10px;
`

const KeyPrice = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  /* identical to box height, or 125% */

  color: #333333;
  padding-left: 16px;
  padding-bottom: 40px;
`

export default connect(mapStateToProps)(VerificationContent)

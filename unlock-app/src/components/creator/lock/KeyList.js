import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'
import { expirationAsDate } from '../../../utils/durations'

// TODO add pagination
export function KeyList ({ keys }) {
  return (
    <>
      <KeyTable>
        <KeyHeader>
          <KeyCell>
            Keys
          </KeyCell>
          <KeyCell>
            Expiration
          </KeyCell>
          <KeyCell>
            Data
          </KeyCell>
        </KeyHeader>
        {Object.values(keys).map((key) => {
          return (
            <KeyRow key={key.id}>
              <KeyData>
                {key.transaction}
              </KeyData>
              <KeyCell>
                {expirationAsDate(key.expiration)}
              </KeyCell>
              <KeyData>
                {key.data}
              </KeyData>
            </KeyRow>
          )
        })}
      </KeyTable>
    </>
  )
}

KeyList.propTypes = {
  keys: UnlockPropTypes.keys,
}

export default KeyList

const KeyTable = styled.div`
`

const KeyRow = styled.div`
  display: grid;
  margin-top: 20px;
  margin-left: 48px;
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 3fr 3fr;
  grid-gap: 36px;
  margin-bottom: 10px;
`

const KeyHeader = styled(KeyRow)`
  font-family: 'IBM Plex Sans';
  font-size: 10px;
  text-transform: uppercase;
`

const KeyCell = styled.div`
`

const KeyData = styled(KeyCell)`
  overflow: hidden;
  text-overflow: ellipsis;
`

import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export function EmbedCodeSnippet({ lock }) {
  function embedCode(lock) {
    return `<!-- Include this script in your <head> section -->
<script src="https://unlock-protocol.com/unlock.js"></script>

<!-- Lock elements by wrapping them in this div -->
<div unlock-lock="${lock.address}">
  This content is only visible to the visitors who have a key to the lock
  ${lock.address}
</div>
`
  }

  function selectAll(event) {
    event.target.select()
  }

  // TODO: add visual confirmation of code having been copied
  return (
    <CodeControls>
      <Label>Code snippet</Label>
      <CodeSnippet value={embedCode(lock)} onClick={selectAll} />
      <Actions>
        <CopyToClipboard text={embedCode(lock)}>
          <Buttons.Copy />
        </CopyToClipboard>
        <Buttons.Preview lock={lock} />
      </Actions>
    </CodeControls>
  )
}

EmbedCodeSnippet.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

export default EmbedCodeSnippet

const Actions = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: repeat(auto-fill, 24px);
  grid-gap: 16px;
`

const Label = styled.span`
  grid-column: 1/3;
  text-transform: uppercase;
  font-size: 9px;
  color: var(--4a4a4a);
`

const CodeControls = styled.div`
  padding-top: 16px;
  padding-left: 48px;
  padding-right: 24px;
  padding-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 24px;
  grid-row-gap: 4px;
  grid-column-gap: 16px;
  margin-bottom: 10px;
`

const CodeSnippet = styled.textarea`
  padding: 8px;
  border-radius: 4px;
  border: 0;
  background-color: var(--offwhite);
  font-family: 'IBM Plex Mono';
  font-size: 14px;
  font-weight: 300;
  color: var(--darkgrey);
  min-height: 170px;
`

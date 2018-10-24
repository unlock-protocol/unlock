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
      <CodeSnippet value={embedCode(lock)} onClick={selectAll}></CodeSnippet>
      <CopyToClipboard text={embedCode(lock)}>
        <Buttons.Copy />
      </CopyToClipboard>
    </CodeControls>
  )
}

EmbedCodeSnippet.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default EmbedCodeSnippet

const CodeControls = styled.div`
  margin-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 32px 7fr 1fr;
  grid-gap: 16px;
  grid-template-rows: 163px;
  margin-bottom: 10px;
`

const CodeSnippet = styled.textarea`
  border-radius: 4px;
  border: 0;
  background-color: var(--lightgrey);
  font-family: 'IBM Plex Mono';
  font-size: 14px;
  font-weight: 300;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: var(--darkgrey);
  grid-column: 2;
`

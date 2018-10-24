import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'

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

  return (
    <CodeSnippet value={embedCode(lock)} onClick={selectAll}></CodeSnippet>
  )
}

EmbedCodeSnippet.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default EmbedCodeSnippet

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

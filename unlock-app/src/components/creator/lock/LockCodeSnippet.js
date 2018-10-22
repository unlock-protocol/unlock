import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../../propTypes'

export function LockCodeSnippet({ lock }) {
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

LockCodeSnippet.propTypes = {
  lock: UnlockPropTypes.lock,
}

export default LockCodeSnippet

const CodeSnippet = styled.textarea`
  width: 100%;
  height: 163px;
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

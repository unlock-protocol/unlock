import React from 'react'
import styled from 'styled-components'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import UnlockPropTypes from '../../../propTypes'
import Buttons from '../../interface/buttons/lock'

export function EmbedCodeSnippet({ lock }) {
  function embedCode(lock) {
    // Autodetect current domain
    let domain = window.location.origin

    return `<!-- Include this script in the <head> section of your page -->
<script src="${domain}/static/paywall.min.js" data-unlock-url="${domain}"></script>
<meta name="lock" content="${lock.address}" />
`
  }

  function selectAll(event) {
    event.target.select()
  }

  // TODO: add visual confirmation of code having been copied
  return (
    <CodeControls>
      <Metadata />
      <Label>Code snippet</Label>
      <CodeSnippet value={embedCode(lock)} onClick={selectAll} readOnly />
      <Actions>
        <CopyToClipboard text={embedCode(lock)}>
          <Buttons.Copy as="button" />
        </CopyToClipboard>
        <Buttons.Preview lock={lock} target="_blank" />
      </Actions>
    </CodeControls>
  )
}

EmbedCodeSnippet.propTypes = {
  lock: UnlockPropTypes.lock.isRequired,
}

const Metadata = () => {
  return (
    <div>
      <MetadataHeader>
        <span>Metering</span>
        <span>Public Name</span>
        <span>Trusted Unlocking</span>
      </MetadataHeader>
      <MetadataBody>
        <div>
          <input type="number" />
          <span>Free Articles</span>
        </div>
        <div>
          <input placeholder="Public Name" />
        </div>
        <div>
          <input type="checkbox" />
          <span>Allow unlocking before transaction is confirmed</span>
        </div>
      </MetadataBody>
    </div>
  )
}

export default EmbedCodeSnippet

const MetadataHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-transform: uppercase;
  font-size: 9px;
  color: var(--4a4a4a);
  margin-bottom: 7px;
`

const MetadataBody = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    background: var(--lightgrey);
    border: 1px solid var(--lightgrey);
    border-radius: 4px;
    height: 26px;
    padding: 0 8px;
    font-family: 'IBM Plex Mono', sans serif;
    font-size: 14px;
    font-weight: 200;
  }

  input:focus {
    outline: none;
    border: 1px solid var(--grey);
    transition: border 100ms ease;
  }

  input[data-valid='false'] {
    border: 1px solid var(--red);
  }

  input:disabled {
    color: var(--silver);
  }

  div:nth-child(1) {
    input {
      width: 3em;
      margin-right: 0.5em;
    }
  }

  div:nth-child(3) {
    display: grid;
    grid-template-columns: 33px 1fr;
    align-items: center;
    input {
      height: 26px;
      width: 26px;
      margin: 0;
      margin-right: 0.5em;
      border: none;
    }
    span {
      font-size: 10px;
    }
  }
`

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

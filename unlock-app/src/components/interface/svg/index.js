import React from 'react'
import About from './About'
import Close from './Close'
import Code from './Code'
import Copy from './Copy'
import Download from './Download'
import Edit from './Edit'
import Eth from './Eth'
import Etherscan from './Etherscan'
import EthSub from './EthSub'
import Export from './Export'
import Github from './Github'
import Lemniscate from './Lemniscate'
import LockClosed from './LockClosed'
import Jobs from './Jobs'
import Preview from './Preview'
import Unlock from './Unlock'
import UnlockWordMark from './UnlockWordMark'
import Upload from './Upload'
import Withdraw from './Withdraw'

function wrapViewBox(WrappedComponent, viewBox) {
  const Wrapped = (props) => (
    <WrappedComponent viewBox={viewBox} {...props} />
  )
  return Wrapped
}

export default {
  About: wrapViewBox(About, '0 0 24 24'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  Copy: wrapViewBox(Copy, '0 0 24 24'),
  Download: wrapViewBox(Download, '0 0 24 24'),
  Edit: wrapViewBox(Edit, '0 0 24 24'),
  Eth: wrapViewBox(Eth, '0 0 24 24'),
  Etherscan: wrapViewBox(Etherscan, '0 0 24 24'),
  EthSub: wrapViewBox(EthSub, '0 0 24 24'),
  Export: wrapViewBox(Export, '0 0 24 24'),
  Github: wrapViewBox(Github, '0 0 24 24'),
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Unlock: wrapViewBox(Unlock, '0 0 24 24'),
  UnlockWordMark,
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
}

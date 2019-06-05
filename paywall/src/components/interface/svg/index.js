import React from 'react'
import About from './About'
import Arrow from './Arrow'
import Checkmark from './Checkmark'
import Close from './Close'
import Code from './Code'
import CoinbaseWallet from './CoinbaseWallet'
import Copy from './Copy'
import Download from './Download'
import Edit from './Edit'
import Eth from './Eth'
import Etherscan from './Etherscan'
import EthSub from './EthSub'
import Export from './Export'
import Github from './Github'
import Jobs from './Jobs'
import Lemniscate from './Lemniscate'
import LockClosed from './LockClosed'
import Log from './Log'
import Metamask from './Metamask'
import Opera from './Opera'
import Preview from './Preview'
import Unlock from './Unlock'
import UnlockWordMark from './UnlockWordMark'
import Upload from './Upload'
import Withdraw from './Withdraw'
import Newsletter from './Email'
import Telegram from './Telegram'
import Twitter from './Twitter'
import Bars from './Bars'
import ChevronUp from './ChevronUp'
import KeyText from './KeyText'
import Box from './Box'
import Info from './Info'

function wrapViewBox(WrappedComponent, viewBox) {
  const Wrapped = props => <WrappedComponent viewBox={viewBox} {...props} />
  return Wrapped
}

export default {
  About: wrapViewBox(About, '0 0 24 24'),
  Arrow: wrapViewBox(Arrow, '0 0 24 24'),
  Checkmark: wrapViewBox(Checkmark, '0 0 24 24'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  CoinbaseWallet: wrapViewBox(CoinbaseWallet, '0 0 120 120'),
  Copy: wrapViewBox(Copy, '0 0 24 24'),
  Download: wrapViewBox(Download, '0 0 24 24'),
  Edit: wrapViewBox(Edit, '0 0 24 24'),
  Eth: wrapViewBox(Eth, '0 0 24 24'),
  Etherscan: wrapViewBox(Etherscan, '0 0 24 24'),
  EthSub: wrapViewBox(EthSub, '0 0 24 24'),
  Export: wrapViewBox(Export, '0 0 24 24'),
  Github: wrapViewBox(Github, '0 0 24 24'),
  Info: wrapViewBox(Info, '0 0 16 16'),
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Log: wrapViewBox(Log, '0 0 24 24'),
  Metamask: wrapViewBox(Metamask, '0 0 120 120'),
  Opera: wrapViewBox(Opera, '0 0 120 120'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Unlock: wrapViewBox(Unlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(UnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
  Newsletter: wrapViewBox(Newsletter, '0 0 24 24'),
  Telegram: wrapViewBox(Telegram, '0 0 24 24'),
  Twitter: wrapViewBox(Twitter, '0 0 24 24'),
  Bars: wrapViewBox(Bars, '0 0 56 42'),
  ChevronUp: wrapViewBox(ChevronUp, '0 0 58 32'),
  KeyText: wrapViewBox(KeyText, '0 0 200 245'),
  Box: wrapViewBox(Box, '0 0 24 24'),
}

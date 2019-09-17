import React from 'react'
import About from './About'
import AppStore from './AppStore'
import Arrow from './Arrow'
import Checkmark from './Checkmark'
import Close from './Close'
import Code from './Code'
import Copy from './Copy'
import Download from './Download'
import Documentation from './Documentation'
import Edit from './Edit'
import Eth from './Eth'
import Etherscan from './Etherscan'
import EthSub from './EthSub'
import Export from './Export'
import Github from './Github'
import Heart from './Heart'
import Lemniscate from './Lemniscate'
import LiveDemo from './LiveDemo'
import Loading from './Loading'
import LockClosed from './LockClosed'
import Log from './Log'
import Jobs from './Jobs'
import Preview from './Preview'
import Unlock from './Unlock'
import UnlockWordMark from './UnlockWordMark'
import Upload from './Upload'
import Withdraw from './Withdraw'
import Newsletter from './Email'
import Telegram from './Telegram'
import Ticket from './Ticket'
import Twitter from './Twitter'
import Bars from './Bars'
import ChevronUp from './ChevronUp'
import Home from './Home'
import Wordpress from './Wordpress'

function wrapViewBox(WrappedComponent, viewBox) {
  const Wrapped = props => <WrappedComponent viewBox={viewBox} {...props} />
  return Wrapped
}

export default {
  AppStore: wrapViewBox(AppStore, '0 0 24 24'),
  About: wrapViewBox(About, '0 0 24 24'),
  Arrow: wrapViewBox(Arrow, '0 0 24 24'),
  Checkmark: wrapViewBox(Checkmark, '0 0 24 24'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  Copy: wrapViewBox(Copy, '0 0 24 24'),
  Documentation: wrapViewBox(Documentation, '-6 -6 76 76'),
  Download: wrapViewBox(Download, '0 0 24 24'),
  Edit: wrapViewBox(Edit, '0 0 24 24'),
  Eth: wrapViewBox(Eth, '0 0 24 24'),
  Etherscan: wrapViewBox(Etherscan, '0 0 24 24'),
  EthSub: wrapViewBox(EthSub, '0 0 24 24'),
  Export: wrapViewBox(Export, '0 0 24 24'),
  Github: wrapViewBox(Github, '0 0 24 24'),
  Heart: wrapViewBox(Heart, '-6 -6 36 36'),
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LiveDemo: wrapViewBox(LiveDemo, '0 0 64 64'),
  Loading: wrapViewBox(Loading, '0 0 32 32'),
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Log: wrapViewBox(Log, '0 0 24 24'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Unlock: wrapViewBox(Unlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(UnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
  Newsletter: wrapViewBox(Newsletter, '0 0 24 24'),
  Telegram: wrapViewBox(Telegram, '0 0 24 24'),
  Ticket: wrapViewBox(Ticket, '-8 -6 40 40'),
  Twitter: wrapViewBox(Twitter, '0 0 24 24'),
  Bars: wrapViewBox(Bars, '0 0 56 42'),
  ChevronUp: wrapViewBox(ChevronUp, '0 0 58 32'),
  Home: wrapViewBox(Home, '0 0 24 24'),
  Wordpress: wrapViewBox(Wordpress, '0 0 340 340'),
}

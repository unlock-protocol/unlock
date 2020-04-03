/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import About from '../build/svg-component/About'
import AppStore from '../build/svg-component/AppStore'
import Arrow from '../build/svg-component/Arrow'
import Attention from '../build/svg-component/Attention'
import Carret from '../build/svg-component/Carret'
import Checkmark from '../build/svg-component/Checkmark'
import Close from '../build/svg-component/Close'
import Code from '../build/svg-component/Code'
import Cog from '../build/svg-component/Cog'
import Copy from '../build/svg-component/Copy'
import Download from '../build/svg-component/Download'
import Documentation from '../build/svg-component/Documentation'
import Edit from '../build/svg-component/Edit'
import Eth from '../build/svg-component/Eth'
import Etherscan from '../build/svg-component/Etherscan'
import EthSub from '../build/svg-component/EthSub'
import Export from '../build/svg-component/Export'
import Github from '../build/svg-component/Github'
import Heart from '../build/svg-component/Heart'
import Key from '../build/svg-component/Key'
import Lemniscate from '../build/svg-component/Lemniscate'
import LiveDemo from '../build/svg-component/LiveDemo'
import Loading from '../build/svg-component/Loading'
import LoadingDots from '../build/svg-component/LoadingDots'
import LockClosed from '../build/svg-component/LockClosed'
import Jobs from '../build/svg-component/Jobs'
import Preview from '../build/svg-component/Preview'
import Unlock from '../build/svg-component/Unlock'
import UnlockWordMark from '../build/svg-component/UnlockWordMark'
import Upload from '../build/svg-component/Upload'
import Withdraw from '../build/svg-component/Withdraw'
import Newsletter from '../build/svg-component/Email'
import Members from '../build/svg-component/Members'
import Telegram from '../build/svg-component/Telegram'
import Ticket from '../build/svg-component/Ticket'
import Twitter from '../build/svg-component/Twitter'
import Bars from '../build/svg-component/Bars'
import ChevronUp from '../build/svg-component/ChevronUp'
import Home from '../build/svg-component/Home'
import Qr from '../build/svg-component/Qr'
import Wordpress from '../build/svg-component/Wordpress'

function wrapViewBox(WrappedComponent, viewBox) {
  const Wrapped = props => <WrappedComponent viewBox={viewBox} {...props} />
  return Wrapped
}

export default {
  AppStore: wrapViewBox(AppStore, '0 0 24 24'),
  About,
  Arrow: wrapViewBox(Arrow, '0 0 24 24'),
  Attention: wrapViewBox(Attention, '0 0 96 96'),
  Carret: wrapViewBox(Carret, '-6 -8 24 24'),
  Checkmark: wrapViewBox(Checkmark, '0 0 24 24'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  Cog,
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
  Key,
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LiveDemo: wrapViewBox(LiveDemo, '0 0 64 64'),
  Loading: wrapViewBox(Loading, '0 0 32 32'),
  LoadingDots,
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Unlock: wrapViewBox(Unlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(UnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
  Newsletter: wrapViewBox(Newsletter, '0 0 24 24'),
  Members: wrapViewBox(Members, '-4 -4 24 24'),
  Telegram: wrapViewBox(Telegram, '0 0 24 24'),
  Ticket: wrapViewBox(Ticket, '-8 -6 40 40'),
  Twitter: wrapViewBox(Twitter, '0 0 24 24'),
  Bars: wrapViewBox(Bars, '0 0 56 42'),
  ChevronUp: wrapViewBox(ChevronUp, '0 0 58 32'),
  Home,
  Qr: wrapViewBox(Qr, '0 0 60 60'),
  Wordpress: wrapViewBox(Wordpress, '0 0 340 340'),
}

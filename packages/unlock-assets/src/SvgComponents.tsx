import React from 'react'
import About from '../build/svg-component/About'
import Adfree from '../build/svg-component/Adfree'
import AppStore from '../build/svg-component/AppStore'
import Arrow from '../build/svg-component/Arrow'
import Attention from '../build/svg-component/Attention'
import Bars from '../build/svg-component/Bars'
import Blog from '../build/svg-component/Blog'
import Carret from '../build/svg-component/Carret'
import Cart from '../build/svg-component/Cart'
import Checkmark from '../build/svg-component/Checkmark'
import ChevronUp from '../build/svg-component/ChevronUp'
import Close from '../build/svg-component/Close'
import Cloudflare from '../build/svg-component/Cloudflare'
import Code from '../build/svg-component/Code'
import Cog from '../build/svg-component/Cog'
import CoinbaseWallet from '../build/svg-component/CoinbaseWallet'
import Copy from '../build/svg-component/Copy'
import CreditCard from '../build/svg-component/CreditCard'
import Decentraland from '../build/svg-component/Decentraland'
import Discord from '../build/svg-component/Discord'
import Discourse from '../build/svg-component/Discourse'
import Docs from '../build/svg-component/Docs'
import Documentation from '../build/svg-component/Documentation'
import Download from '../build/svg-component/Download'
import Edit from '../build/svg-component/Edit'
import Eth from '../build/svg-component/Eth'
import Etherscan from '../build/svg-component/Etherscan'
import EthSub from '../build/svg-component/EthSub'
import Export from '../build/svg-component/Export'
import Firebase from '../build/svg-component/Firebase'
import Github from '../build/svg-component/Github'
import Heart from '../build/svg-component/Heart'
import Home from '../build/svg-component/Home'
import Idea from '../build/svg-component/Idea'
import Info from '../build/svg-component/Info'
import Jobs from '../build/svg-component/Jobs'
import Key from '../build/svg-component/Key'
import Lemniscate from '../build/svg-component/Lemniscate'
import LiveDemo from '../build/svg-component/LiveDemo'
import Loading from '../build/svg-component/Loading'
import LoadingDots from '../build/svg-component/LoadingDots'
import Lock from '../build/svg-component/Lock'
import LockClosed from '../build/svg-component/LockClosed'
import Log from '../build/svg-component/Log'
import Members from '../build/svg-component/Members'
import Metamask from '../build/svg-component/Metamask'
import Newsletter from '../build/svg-component/Email'
import Opera from '../build/svg-component/Opera'
import Person from '../build/svg-component/Person'
import Preview from '../build/svg-component/Preview'
import Qr from '../build/svg-component/Qr'
import Shopify from '../build/svg-component/Shopify'
import Telegram from '../build/svg-component/Telegram'
import Ticket from '../build/svg-component/Ticket'
import Twitter from '../build/svg-component/Twitter'
import Unlock from '../build/svg-component/Unlock'
import UnlockWordMark from '../build/svg-component/UnlockWordMark'
import Upload from '../build/svg-component/Upload'
import Wallet from '../build/svg-component/Wallet'
import WalletConnect from '../build/svg-component/WalletConnect'
import Webflow from '../build/svg-component/Webflow'
import Withdraw from '../build/svg-component/Withdraw'
import Wordpress from '../build/svg-component/Wordpress'
import UnlockMonogram from '../build/svg-component/UnlockMonogram'
import RocketLaunch from '../build/svg-component/RocketLaunch'

function wrapViewBox(
  WrappedComponent: typeof About,
  viewBox: string | undefined
) {
  const Wrapped = (props: any) => <WrappedComponent viewBox={viewBox} {...props} />
  return Wrapped
}

export default {
  About,
  Adfree: wrapViewBox(Adfree, '-3 -7 36 36'),
  AppStore: wrapViewBox(AppStore, '0 0 24 24'),
  Arrow: wrapViewBox(Arrow, '0 0 24 24'),
  Attention: wrapViewBox(Attention, '0 0 96 96'),
  Bars: wrapViewBox(Bars, '0 0 56 42'),
  Blog,
  Carret: wrapViewBox(Carret, '-6 -8 24 24'),
  Cart: wrapViewBox(Cart, '-3 -3 24 24'),
  Checkmark: wrapViewBox(Checkmark, '0 0 24 24'),
  ChevronUp: wrapViewBox(ChevronUp, '0 0 58 32'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Cloudflare: wrapViewBox(Cloudflare, '-4 -4 32 32'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  Cog,
  CoinbaseWallet,
  Copy: wrapViewBox(Copy, '0 0 24 24'),
  CreditCard: wrapViewBox(CreditCard, '-12 -16 48 48'),
  Decentraland: wrapViewBox(Decentraland, '0 0 512 512'),
  Discord: wrapViewBox(Discord, '-4 -4 32 32'),
  Discourse: wrapViewBox(Discourse, '-5 -3 32 32'),
  Docs: wrapViewBox(Docs, '-6 -5 24 24'),
  Documentation: wrapViewBox(Documentation, '-6 -6 76 76'),
  Download: wrapViewBox(Download, '0 0 24 24'),
  Edit: wrapViewBox(Edit, '0 0 24 24'),
  Eth: wrapViewBox(Eth, '0 0 24 24'),
  Etherscan: wrapViewBox(Etherscan, '0 0 24 24'),
  EthSub: wrapViewBox(EthSub, '0 0 24 24'),
  Export: wrapViewBox(Export, '0 0 24 24'),
  Firebase: wrapViewBox(Firebase, '-6 0 150 140'),
  Github: wrapViewBox(Github, '0 0 24 24'),
  Heart: wrapViewBox(Heart, '-6 -6 36 36'),
  Home,
  Idea,
  Info,
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Key,
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LiveDemo: wrapViewBox(LiveDemo, '0 0 64 64'),
  Loading: wrapViewBox(Loading, '0 0 32 32'),
  LoadingDots,
  Lock: wrapViewBox(Lock, '-15 -4 120 120'),
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Log: wrapViewBox(Log, '0 0 24 24'),
  Members: wrapViewBox(Members, '-4 -4 24 24'),
  Metamask,
  Newsletter: wrapViewBox(Newsletter, '0 0 24 24'),
  Opera,
  Person: wrapViewBox(Person, '-6.5 -5 32 32'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Qr: wrapViewBox(Qr, '0 0 60 60'),
  Shopify: wrapViewBox(Shopify, '-4 -4 40 40'),
  Telegram: wrapViewBox(Telegram, '0 0 24 24'),
  Ticket: wrapViewBox(Ticket, '-8 -6 40 40'),
  Twitter: wrapViewBox(Twitter, '0 0 24 24'),
  RocketLaunch,
  Unlock: wrapViewBox(Unlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(UnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  UnlockMonogram,
  Wallet: wrapViewBox(Wallet, '-8 -8 32 32'),
  WalletConnect: wrapViewBox(WalletConnect, '0 -1 32 32'),
  Webflow: wrapViewBox(Webflow, '-4 -8 32 32'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
  Wordpress: wrapViewBox(Wordpress, '0 0 340 340'),
}
